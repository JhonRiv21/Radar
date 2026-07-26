import { readFileSync } from "node:fs";
import { join } from "node:path";

type Ring = number[][];
type Country = { name: string; polygons: Ring[][] };

let cache: Country[] | null = null;

function load(): Country[] {
  if (cache) return cache;
  const raw = readFileSync(
    join(process.cwd(), "public", "world-countries.geojson"),
    "utf8",
  );
  const geo = JSON.parse(raw) as {
    features: {
      properties: { name: string };
      geometry: { type: string; coordinates: number[][][] | number[][][][] };
    }[];
  };

  cache = geo.features.map((f) => ({
    name: f.properties.name,
    polygons:
      f.geometry.type === "Polygon"
        ? [f.geometry.coordinates as Ring[]]
        : (f.geometry.coordinates as Ring[][]),
  }));
  return cache;
}

function inRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function inPolygon(lng: number, lat: number, polygon: Ring[]): boolean {
  if (!inRing(lng, lat, polygon[0])) return false;
  return !polygon.slice(1).some((hole) => inRing(lng, lat, hole));
}

export function countryAt(lng: number, lat: number): string | null {
  for (const country of load()) {
    if (country.polygons.some((p) => inPolygon(lng, lat, p))) {
      return country.name;
    }
  }
  return null;
}
