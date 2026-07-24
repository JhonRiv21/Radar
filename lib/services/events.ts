import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { events, ingestRuns } from "@/lib/db/schema";
import type { EventRow, IngestRun } from "@/lib/types/event";

export async function getRecentEvents(limit = 60): Promise<EventRow[]> {
  return await db
    .select()
    .from(events)
    .orderBy(desc(events.ingestedAt))
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
