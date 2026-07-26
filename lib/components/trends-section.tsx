import { getHazardPoints, getCountries } from "@/lib/services/hazards";
import { HazardStats } from "@/lib/components/hazard-stats";
import type { HazardPoint } from "@/lib/types/hazard";

export async function TrendsSection() {
  let points: HazardPoint[];
  let countries: string[];
  try {
    [points, countries] = await Promise.all([
      getHazardPoints(),
      getCountries(),
    ]);
  } catch {
    return null;
  }
  return <HazardStats points={points} countries={countries} />;
}
