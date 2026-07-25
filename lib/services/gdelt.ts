import { eq, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { events, ingestRuns } from "@/lib/db/schema";
import type { GdeltArticle } from "@/lib/types/gdelt";
import { resolveCentroid } from "@/lib/utils/geo";

const SOURCE = "gdelt-doc";
const GDELT_QUERY = process.env.GDELT_QUERY ?? "(election OR protest OR earthquake)";
const LANG_FILTER = "(sourcelang:english OR sourcelang:spanish)";
const ALLOWED_LANGS = new Set(["english", "spanish"]);
const GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc";

function parseSeenDate(value?: string): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
}

async function fetchArticles(): Promise<GdeltArticle[]> {
  const params = new URLSearchParams({
    query: `${GDELT_QUERY} ${LANG_FILTER}`,
    mode: "artlist",
    maxrecords: "75",
    format: "json",
    sort: "datedesc",
    timespan: "24h",
  });

  const res = await fetch(`${GDELT_URL}?${params}`, {
    headers: { "user-agent": "radar.riverogz.com" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GDELT HTTP ${res.status}`);

  const body = await res.text();
  let data: { articles?: GdeltArticle[] };
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error("GDELT devolvió una respuesta no-JSON");
  }
  return data.articles ?? [];
}

async function storeArticles(articles: GdeltArticle[]): Promise<number> {
  let inserted = 0;
  for (const article of articles) {
    if (!article.url) continue;
    const lang = article.language?.toLowerCase();
    if (lang && !ALLOWED_LANGS.has(lang)) continue;
    const centroid = resolveCentroid(article.sourcecountry);
    const result = await db
      .insert(events)
      .values({
        externalId: article.url,
        source: SOURCE,
        title: article.title ?? null,
        url: article.url,
        sourceDomain: article.domain ?? null,
        country: article.sourcecountry ?? null,
        lang: article.language ?? null,
        lat: centroid?.lat ?? null,
        lng: centroid?.lng ?? null,
        occurredAt: parseSeenDate(article.seendate),
      })
      .onConflictDoNothing({ target: events.externalId })
      .returning({ id: events.id });
    if (result.length) inserted++;
  }
  return inserted;
}

// GDELT pide un máximo de 1 petición cada 5s; evitamos que un doble clic la dispare.
const MIN_INTERVAL_MS = 10_000;

export async function runIngest() {
  const [recent] = await db
    .select({ id: ingestRuns.id })
    .from(ingestRuns)
    .where(gt(ingestRuns.startedAt, new Date(Date.now() - MIN_INTERVAL_MS)))
    .limit(1);
  if (recent) return { ok: true, skipped: true };

  const [run] = await db
    .insert(ingestRuns)
    .values({ source: SOURCE })
    .returning({ id: ingestRuns.id });

  try {
    const articles = await fetchArticles();
    const inserted = await storeArticles(articles);
    await db
      .update(ingestRuns)
      .set({ finishedAt: new Date(), status: "ok", rows: inserted })
      .where(eq(ingestRuns.id, run.id));
    return { ok: true, fetched: articles.length, inserted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(ingestRuns)
      .set({ finishedAt: new Date(), status: "error", error: message })
      .where(eq(ingestRuns.id, run.id));
    return { ok: false, error: message };
  }
}
