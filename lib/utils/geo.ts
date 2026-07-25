import { COUNTRY_CENTROIDS, COUNTRY_ALIASES } from "@/lib/assets/country-centroids";
import type { CountryHotspot } from "@/lib/types/event";

export function resolveCentroid(
  country: string | null | undefined,
): { lat: number; lng: number } | null {
  if (!country) return null;
  const key = country.trim().toLowerCase();
  const resolved = COUNTRY_ALIASES[key] ?? key;
  return COUNTRY_CENTROIDS[resolved] ?? null;
}

export function hotspotsToGeoJson(hotspots: CountryHotspot[]) {
  return {
    type: "FeatureCollection" as const,
    features: hotspots.map((h) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [h.lng, h.lat] },
      properties: { country: h.country ?? "—", count: h.count },
    })),
  };
}
