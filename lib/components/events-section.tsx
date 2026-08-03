import { getHazardsPage, getHazardsCount } from "@/lib/services/hazards";
import { HazardStream } from "@/lib/components/hazard-stream";
import { DbError } from "@/lib/components/db-error";
import type { HazardRow } from "@/lib/types/hazard";

const INITIAL_FILTERS = { kinds: [], country: null, days: 30 };

export async function EventsSection() {
  let hazards: HazardRow[];
  let total: number;
  try {
    [hazards, total] = await Promise.all([
      getHazardsPage(1, INITIAL_FILTERS),
      getHazardsCount(INITIAL_FILTERS),
    ]);
  } catch (err) {
    console.error("[events-section] fallo al leer amenazas", err);
    return <DbError />;
  }

  return <HazardStream initial={hazards} total={total} />;
}
