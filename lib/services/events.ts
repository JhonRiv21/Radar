import { desc, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { events, ingestRuns } from "@/lib/db/schema";
import type { EventRow, IngestRun, CountryHotspot } from "@/lib/types/event";

export async function getRecentEvents(limit = 60): Promise<EventRow[]> {
  return await db
    .select()
    .from(events)
    .orderBy(sql`${events.occurredAt} desc nulls last`, desc(events.ingestedAt))
    .limit(limit);
}

export async function getLastRun(): Promise<IngestRun | null> {
  const [run] = await db
    .select()
    .from(ingestRuns)
    .orderBy(desc(ingestRuns.startedAt))
    .limit(1);
  return run ?? null;
}

export async function getCountryHotspots(): Promise<CountryHotspot[]> {
  const rows = await db
    .select({
      country: events.country,
      lat: events.lat,
      lng: events.lng,
      count: sql<number>`count(*)::int`,
    })
    .from(events)
    .where(isNotNull(events.lat))
    .groupBy(events.country, events.lat, events.lng)
    .orderBy(desc(sql`count(*)`));

  return rows.flatMap((r) =>
    r.lat === null || r.lng === null
      ? []
      : [{ country: r.country, lat: r.lat, lng: r.lng, count: r.count }],
  );
}
