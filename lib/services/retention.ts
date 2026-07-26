import { lt, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { hazards, ingestRuns } from "@/lib/db/schema";

const HAZARD_RETENTION_DAYS = 90;
const RUN_RETENTION_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

async function countBefore(cutoff: Date) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int`.as("n") })
    .from(hazards)
    .where(lt(hazards.occurredAt, cutoff));
  return row?.n ?? 0;
}

async function hasFreshData() {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int`.as("n") })
    .from(hazards)
    .where(gte(hazards.ingestedAt, new Date(Date.now() - DAY_MS)));
  return (row?.n ?? 0) > 0;
}

export async function cleanupOldData() {
  if (!(await hasFreshData())) {
    return { skipped: "sin datos nuevos en 24h", deleted: 0 };
  }

  const cutoff = new Date(Date.now() - HAZARD_RETENTION_DAYS * DAY_MS);
  const deleted = await countBefore(cutoff);
  if (deleted > 0) {
    await db.delete(hazards).where(lt(hazards.occurredAt, cutoff));
  }

  const runCutoff = new Date(Date.now() - RUN_RETENTION_DAYS * DAY_MS);
  await db.delete(ingestRuns).where(lt(ingestRuns.startedAt, runCutoff));

  return { deleted };
}
