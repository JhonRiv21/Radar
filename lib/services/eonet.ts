import type { HazardInsert, HazardKind } from "@/lib/types/hazard";

const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";

const CATEGORY_KIND: Record<string, HazardKind> = {
  wildfires: "wildfire",
  floods: "flood",
  severeStorms: "storm",
  volcanoes: "volcano",
  seaLakeIce: "ice",
};

type EonetEvent = {
  id: string;
  title: string;
  link: string | null;
  categories: { id: string; title: string }[];
  geometry: {
    date: string;
    type: string;
    coordinates: number[] | number[][][];
  }[];
};

function firstPoint(geometry: EonetEvent["geometry"][number]): [number, number] | null {
  const coords = geometry.coordinates;
  if (geometry.type === "Point" && typeof coords[0] === "number") {
    return [coords[0] as number, coords[1] as number];
  }
  const ring = (coords as number[][][])[0]?.[0];
  return Array.isArray(ring) ? [ring[0], ring[1]] : null;
}

function toHazard(event: EonetEvent): HazardInsert | null {
  const kind = CATEGORY_KIND[event.categories[0]?.id ?? ""];
  if (!kind) return null;

  const latest = event.geometry.at(-1);
  if (!latest) return null;
  const point = firstPoint(latest);
  if (!point) return null;

  return {
    externalId: `eonet:${event.id}`,
    source: "eonet",
    kind,
    title: event.title,
    place: null,
    lat: point[1],
    lng: point[0],
    url: event.link,
    occurredAt: new Date(latest.date),
    tsunami: false,
  };
}

export async function fetchNaturalEvents(days: number): Promise<HazardInsert[]> {
  const params = new URLSearchParams({ days: String(days), status: "all" });
  const res = await fetch(`${EONET_URL}?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`EONET HTTP ${res.status}`);

  const body = (await res.json()) as { events?: EonetEvent[] };
  return (body.events ?? []).flatMap((e) => {
    const hazard = toHazard(e);
    return hazard ? [hazard] : [];
  });
}
