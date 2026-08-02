import { getHazardPoints } from "@/lib/services/hazards";
import { EventTicker } from "@/lib/components/event-ticker";
import type { HazardPoint } from "@/lib/types/hazard";

export async function TickerSection() {
  let points: HazardPoint[];
  try {
    points = await getHazardPoints();
  } catch {
    return null;
  }
  return <EventTicker points={points} />;
}
