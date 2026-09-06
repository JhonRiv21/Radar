import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { ingestRuns } from "@/lib/db/schema";
import type { PipelineHealth } from "@/lib/types/event";

// Si la última ingesta correcta supera este margen, los datos se marcan desactualizados.
const STALE_AFTER_MS = 90 * 60 * 1000;

export async function getPipelineHealth(): Promise<PipelineHealth> {
  const [lastRun] = await db
    .select()
    .from(ingestRuns)
    .orderBy(desc(ingestRuns.startedAt))
    .limit(1);

  const [lastSuccess] = await db
    .select()
    .from(ingestRuns)
    .where(eq(ingestRuns.status, "ok"))
    .orderBy(desc(ingestRuns.startedAt))
    .limit(1);

  const lastSuccessAt =
    lastSuccess?.finishedAt ?? lastSuccess?.startedAt ?? null;
  const lastRunAt = lastRun?.finishedAt ?? lastRun?.startedAt ?? null;

  if (!lastRun) {
    return { level: "empty", lastSuccessAt, lastRunAt };
  }
  if (lastRun.status === "error") {
    return { level: "error", lastSuccessAt, lastRunAt };
  }
  if (!lastSuccessAt || Date.now() - lastSuccessAt.getTime() > STALE_AFTER_MS) {
    return { level: "stale", lastSuccessAt, lastRunAt };
  }
  return { level: "fresh", lastSuccessAt, lastRunAt };
}
