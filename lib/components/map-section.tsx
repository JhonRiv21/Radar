import { getHazardPoints } from "@/lib/services/hazards";
import { EventMap } from "@/lib/components/event-map";
import { DbError } from "@/lib/components/db-error";
import type { HazardPoint } from "@/lib/types/hazard";

export async function MapSection() {
  let points: HazardPoint[];
  try {
    points = await getHazardPoints();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error de base de datos";
    return (
      <div className="p-6">
        <DbError message={message} />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <EventMap points={points} />
    </div>
  );
}
