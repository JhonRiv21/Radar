import { getHazardsPage } from "@/lib/services/hazards";
import { HazardStream } from "@/lib/components/hazard-stream";
import { DbError } from "@/lib/components/db-error";
import type { HazardRow } from "@/lib/types/hazard";

const INITIAL_FILTERS = { kinds: [], country: null, days: 30 };

export async function EventsSection() {
  let hazards: HazardRow[];
  try {
    hazards = await getHazardsPage(1, INITIAL_FILTERS);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error de base de datos";
    return <DbError message={message} />;
  }

  return <HazardStream initial={hazards} />;
}
