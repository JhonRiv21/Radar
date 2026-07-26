import { HAZARD_KINDS } from "@/lib/assets/hazard-kinds";
import type { HazardPoint } from "@/lib/types/hazard";

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

export function hazardsToGeoJson(points: HazardPoint[]) {
  return {
    type: "FeatureCollection" as const,
    features: points.map((p) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        kind: p.kind,
        title: p.title,
        color: HAZARD_KINDS[p.kind].color,
        weight: p.magnitude ?? 3
      },
    })),
  };
}
