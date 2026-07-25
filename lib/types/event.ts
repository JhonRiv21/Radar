import type { events, ingestRuns } from "@/lib/db/schema";

export type EventRow = typeof events.$inferSelect;
export type IngestRun = typeof ingestRuns.$inferSelect;

export type EventCluster = {
  lead: EventRow;
  coverage: number;
  sources: string[];
};

export type TrendingTerm = {
  term: string;
  recent: number;
  baselineDaily: number;
  lift: number;
  share: number;
  series: number[];
};

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
