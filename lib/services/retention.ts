import { lt, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { events, ingestRuns } from "@/lib/db/schema";

const EVENT_RETENTION_DAYS = 30;
const RUN_RETENTION_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

async function countBefore(cutoff: Date) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(events)
    .where(lt(events.ingestedAt, cutoff));
  return row.n;
}

async function hasFreshData() {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(events)
    .where(gte(events.ingestedAt, new Date(Date.now() - DAY_MS)));
  return row.n > 0;
}

// Solo purga si entraron datos en las últimas 24h: si la ingesta se rompe,
// preferimos historia vieja antes que una base vacía.
export async function cleanupOldData() {
  if (!(await hasFreshData())) {
    return { skipped: "sin datos nuevos en 24h", deleted: 0 };
  }

  const eventCutoff = new Date(Date.now() - EVENT_RETENTION_DAYS * DAY_MS);
  const deleted = await countBefore(eventCutoff);
  if (deleted > 0) {
    await db.delete(events).where(lt(events.ingestedAt, eventCutoff));
  }

  const runCutoff = new Date(Date.now() - RUN_RETENTION_DAYS * DAY_MS);
  await db.delete(ingestRuns).where(lt(ingestRuns.startedAt, runCutoff));

  return { deleted };
}
