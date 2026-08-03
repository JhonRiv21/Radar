import { getHazardPoints } from "@/lib/services/hazards";
import { EventMap } from "@/lib/components/event-map";
import { DbError } from "@/lib/components/db-error";
import type { HazardPoint } from "@/lib/types/hazard";

export async function MapSection() {
  let points: HazardPoint[];
  try {
    points = await getHazardPoints();
  } catch (err) {
    console.error("[map-section] fallo al leer amenazas", err);
    return (
      <div className="p-6">
        <DbError />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <EventMap points={points} />
    </div>
  );
}
