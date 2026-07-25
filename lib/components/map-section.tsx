import { getCountryHotspots } from "@/lib/services/events";
import { EventMap } from "@/lib/components/event-map";
import { DbError } from "@/lib/components/db-error";
import type { CountryHotspot } from "@/lib/types/event";

export async function MapSection() {
  let hotspots: CountryHotspot[];
  try {
    hotspots = await getCountryHotspots();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error de base de datos";
    return (
      <div className="p-6">
        <DbError message={message} />
      </div>
    );
  }

  const total = hotspots.reduce((sum, h) => sum + h.count, 0);

  return (
    <div className="relative h-full w-full">
      <EventMap hotspots={hotspots} />
      <div className="glass-soft pointer-events-none absolute bottom-4 right-4 rounded-md px-3 py-1.5 text-xs text-muted">
        {hotspots.length} países · {total} eventos
      </div>
    </div>
  );
}
