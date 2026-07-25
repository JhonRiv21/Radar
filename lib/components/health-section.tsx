import { getPipelineHealth } from "@/lib/services/health";
import { FreshnessPill } from "@/lib/components/freshness-pill";
import type { PipelineHealth } from "@/lib/types/event";

const UNKNOWN: PipelineHealth = {
  level: "empty",
  lastSuccessAt: null,
  lastRunAt: null,
  error: null,
};

export async function HealthSection() {
  let health: PipelineHealth;
  try {
    health = await getPipelineHealth();
  } catch {
    health = UNKNOWN;
  }
  return <FreshnessPill health={health} />;
}
