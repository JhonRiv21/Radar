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

// Territorios y estados que USGS nombra sin su país soberano.
const TERRITORY_ALIASES: Record<string, string> = {
  alaska: "United States of America",
  hawaii: "United States of America",
  "puerto rico": "United States of America",
  guam: "United States of America",
  "northern mariana islands": "United States of America",
  "u.s. virgin islands": "United States of America",
};

let nameIndex: [string, string][] | null = null;

function names(): [string, string][] {
  if (nameIndex) return nameIndex;
  const entries: [string, string][] = load().map((c) => [
    c.name.toLowerCase(),
    c.name,
  ]);
  entries.push(...Object.entries(TERRITORY_ALIASES));
  // Del más largo al más corto: evita que "Chad" gane sobre "Republic of Chad".
  nameIndex = entries.sort((a, b) => b[0].length - a[0].length);
  return nameIndex;
}

// Respaldo para epicentros mar adentro: USGS los nombra "58 km WSW of X, Mexico".
export function countryFromText(text: string | null): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  const tail = (lower.split(",").pop() ?? "").trim();
  const exact = names().find(([key]) => key === tail);
  if (exact) return exact[1];
  return names().find(([key]) => lower.includes(key))?.[1] ?? null;
}

export function resolveCountry(
  lng: number,
  lat: number,
  ...texts: (string | null)[]
): string | null {
  return (
    countryAt(lng, lat) ??
    texts.reduce<string | null>((found, t) => found ?? countryFromText(t), null)
  );
}
