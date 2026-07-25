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

// Retícula de meridianos y paralelos: da lectura de globo terráqueo técnico.
export function graticule(step = 20) {
  const features = [];
  for (let lng = -180; lng <= 180; lng += step) {
    const line: [number, number][] = [];
    for (let lat = -90; lat <= 90; lat += 5) line.push([lng, lat]);
    features.push({
      type: "Feature" as const,
      geometry: { type: "LineString" as const, coordinates: line },
      properties: {},
    });
  }
  for (let lat = -80; lat <= 80; lat += step) {
    const line: [number, number][] = [];
    for (let lng = -180; lng <= 180; lng += 5) line.push([lng, lat]);
    features.push({
      type: "Feature" as const,
      geometry: { type: "LineString" as const, coordinates: line },
      properties: {},
    });
  }
  return { type: "FeatureCollection" as const, features };
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
