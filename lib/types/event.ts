export type FreshnessLevel = "fresh" | "stale" | "error" | "empty";

export type PipelineHealth = {
  level: FreshnessLevel;
  lastSuccessAt: Date | null;
  lastRunAt: Date | null;
  error: string | null;
};
