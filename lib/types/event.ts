import type { events, ingestRuns } from "@/lib/db/schema";

export type EventRow = typeof events.$inferSelect;
export type IngestRun = typeof ingestRuns.$inferSelect;

export type FreshnessLevel = "fresh" | "stale" | "error" | "empty";

export type PipelineHealth = {
  level: FreshnessLevel;
  lastSuccessAt: Date | null;
  lastRunAt: Date | null;
  error: string | null;
};

export type CountryHotspot = {
  country: string | null;
  lat: number;
  lng: number;
  count: number;
};
