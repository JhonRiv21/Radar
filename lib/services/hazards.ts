import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { hazards, ingestRuns } from "@/lib/db/schema";
import { fetchEarthquakes } from "@/lib/services/usgs";
import { fetchNaturalEvents } from "@/lib/services/eonet";
import { fetchDroughts } from "@/lib/services/gdacs";
import { resolveCountry } from "@/lib/utils/reverse-geocode";
import { safeUrl } from "@/lib/utils/safe-url";
import { memoTtl } from "@/lib/utils/cache";
import type {
  HazardInsert,
  HazardRow,
  HazardPoint,
  HazardKind,
  HazardFilters,
} from "@/lib/types/hazard";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;
const READ_TTL_MS = 60 * 1000;
const MAX_POINTS = 2000;

export const PAGE_SIZE = 10;

function since(days = WINDOW_DAYS) {
  return new Date(Date.now() - days * DAY_MS);
}

async function store(rows: HazardInsert[]): Promise<number> {
  let inserted = 0;
  for (const row of rows) {
    const result = await db
      .insert(hazards)
      .values(row)
      .onConflictDoNothing({ target: hazards.externalId })
      .returning({ id: hazards.id });
    if (result.length) inserted++;
  }
  return inserted;
}

export async function runHazardIngest(days: number) {
  const [run] = await db
    .insert(ingestRuns)
    .values({ source: "usgs+eonet" })
    .returning({ id: ingestRuns.id });

  try {
    const result = await ingestHazards(days);
    await db
      .update(ingestRuns)
      .set({ finishedAt: new Date(), status: "ok", rows: result.inserted })
      .where(eq(ingestRuns.id, run.id));
    return { ok: true, ...result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(ingestRuns)
      .set({ finishedAt: new Date(), status: "error", error: message })
      .where(eq(ingestRuns.id, run.id));
    return { ok: false, error: message };
  }
}

export async function ingestHazards(days: number) {
  const [quakes, natural, droughts] = await Promise.all([
    fetchEarthquakes(since(days)),
    fetchNaturalEvents(days),
    fetchDroughts(),
  ]);
  const rows = [...quakes, ...natural, ...droughts].map((row) => ({
    ...row,
    url: safeUrl(row.url),
    country: resolveCountry(row.lng, row.lat, row.place ?? null, row.title),
  }));
  const inserted = await store(rows);
  return { fetched: rows.length, inserted };
}

export const getHazardPoints = memoTtl(async (): Promise<HazardPoint[]> => {
  const rows = await db
    .select({
      id: hazards.id,
      lat: hazards.lat,
      lng: hazards.lng,
      kind: hazards.kind,
      magnitude: hazards.magnitude,
      title: hazards.title,
      country: hazards.country,
      occurredAt: hazards.occurredAt,
    })
    .from(hazards)
    .where(gte(hazards.occurredAt, since()))
    .orderBy(desc(hazards.occurredAt))
    .limit(MAX_POINTS);

  return rows.map((r) => ({ ...r, kind: r.kind as HazardKind }));
}, READ_TTL_MS);

export async function getHazardUrl(id: string): Promise<string | null> {
  const [row] = await db
    .select({ url: hazards.url })
    .from(hazards)
    .where(eq(hazards.id, id))
    .limit(1);
  return row?.url ?? null;
}

export const getCountries = memoTtl(async (): Promise<string[]> => {
  const rows = (await db.execute(sql`
    select distinct country
    from radar.hazards
    where country is not null
      and occurred_at > now() - interval '30 days'
    order by country
  `)) as unknown as { country: string }[];
  return rows.map((r) => r.country);
}, READ_TTL_MS);

function buildWhere(filters: HazardFilters) {
  const clauses = [gte(hazards.occurredAt, since(filters.days))];
  if (filters.kinds.length) clauses.push(inArray(hazards.kind, filters.kinds));
  if (filters.country) clauses.push(eq(hazards.country, filters.country));
  return and(...clauses);
}

export async function getHazardsPage(
  page: number,
  filters: HazardFilters,
): Promise<HazardRow[]> {
  return await db
    .select()
    .from(hazards)
    .where(buildWhere(filters))
    .orderBy(desc(hazards.occurredAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
}

export async function getHazardsCount(filters: HazardFilters): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int`.as("n") })
    .from(hazards)
    .where(buildWhere(filters));
  return row?.n ?? 0;
}
