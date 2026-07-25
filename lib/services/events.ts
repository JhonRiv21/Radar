import { desc, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import type { EventRow, CountryHotspot } from "@/lib/types/event";

export const PAGE_SIZE = 10;

export async function getEventsPage(page: number): Promise<EventRow[]> {
  return await db
    .select()
    .from(events)
    .orderBy(sql`${events.occurredAt} desc nulls last`, desc(events.ingestedAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
}

export async function getEventsCount(): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(events);
  return row?.n ?? 0;
}

// Devuelve solo coordenada y conteo, no los eventos completos.
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
