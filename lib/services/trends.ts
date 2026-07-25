import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { STOPWORDS } from "@/lib/assets/stopwords";
import type { TrendingTerm } from "@/lib/types/event";

const BASELINE_DAYS = 6;
const MIN_RECENT = 3;
const MAX_TERMS = 8;
const BUCKETS = 12;
const BUCKET_SECONDS = 7200;

const TOKENS = sql`
  select e.occurred_at,
         translate(lower(t.term), 'áéíóúàèìòùâêîôûäëïöüñç', 'aeiouaeiouaeiouaeiounc') as term
  from radar.events e,
       unnest(regexp_split_to_array(coalesce(e.title, ''), '[^A-Za-z0-9À-ÿ]+')) as t(term)
  where e.title is not null
`;

type AggRow = { term: string; recent: number; baseline: number };
type SeriesRow = { term: string; bucket: number; n: number };

async function fetchSeries(terms: string[]): Promise<Map<string, number[]>> {
  const series = new Map<string, number[]>(
    terms.map((term) => [term, Array<number>(BUCKETS).fill(0)]),
  );
  if (!terms.length) return series;

  const rows = (await db.execute(sql`
    with tokens as (
      ${TOKENS} and e.occurred_at > now() - interval '24 hours'
    )
    select term,
           floor(extract(epoch from (now() - occurred_at)) / ${BUCKET_SECONDS})::int as bucket,
           count(*)::int as n
    from tokens
    where term = any(string_to_array(${terms.join(",")}, ','))
    group by term, bucket
  `)) as unknown as SeriesRow[];

  for (const { term, bucket, n } of rows) {
    const points = series.get(term);
    // bucket 0 es el más reciente: se invierte para que la gráfica avance en el tiempo.
    if (points && bucket < BUCKETS) points[BUCKETS - 1 - bucket] = n;
  }
  return series;
}

async function countRecentHeadlines(): Promise<number> {
  const [row] = (await db.execute(sql`
    select count(*)::int as n
    from radar.events
    where occurred_at > now() - interval '24 hours'
  `)) as unknown as { n: number }[];
  return row?.n ?? 0;
}

// Tendencias: frecuencia de términos en 24h contra su promedio diario previo.
export async function getTrendingTerms(): Promise<TrendingTerm[]> {
  const rows = (await db.execute(sql`
    with tokens as (
      ${TOKENS} and e.occurred_at > now() - interval '7 days'
    )
    select term,
      count(*) filter (where occurred_at > now() - interval '24 hours')::int as recent,
      count(*) filter (where occurred_at <= now() - interval '24 hours')::int as baseline
    from tokens
    where length(term) >= 4
      and not (term = any(string_to_array(${STOPWORDS.join(",")}, ',')))
    group by term
    having count(*) filter (where occurred_at > now() - interval '24 hours') >= ${MIN_RECENT}
    order by recent desc
    limit 100
  `)) as unknown as AggRow[];

  const top = rows
    .map(({ term, recent, baseline }) => {
      const baselineDaily = baseline / BASELINE_DAYS;
      return { term, recent, baselineDaily, lift: recent / (baselineDaily + 1) };
    })
    .sort((a, b) => b.lift - a.lift)
    .slice(0, MAX_TERMS);

  const [series, headlines] = await Promise.all([
    fetchSeries(top.map((t) => t.term)),
    countRecentHeadlines(),
  ]);

  return top.map((term) => ({
    ...term,
    share: headlines ? (term.recent / headlines) * 100 : 0,
    series: series.get(term.term) ?? Array<number>(BUCKETS).fill(0),
  }));
}
