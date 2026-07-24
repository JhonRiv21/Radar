import type { events, ingestRuns } from "@/lib/db/schema";

export type EventRow = typeof events.$inferSelect;
export type IngestRun = typeof ingestRuns.$inferSelect;
