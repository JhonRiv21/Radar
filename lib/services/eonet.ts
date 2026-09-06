import type { HazardInsert, HazardKind } from "@/lib/types/hazard";

const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";

const CATEGORY_KIND: Record<string, HazardKind> = {
  wildfires: "wildfire",
  floods: "flood",
  severeStorms: "storm",
  volcanoes: "volcano",
  seaLakeIce: "ice",
};

// El campo `link` de EONET apunta a su propio JSON; solo sirven las fuentes externas,
// y no todas son páginas: JTWC y NATICE devuelven archivos crudos.
const RAW_DATA_URL = /\.(csv|txt|tcw|ascat|json|xml|zip)(\?|$)/i;

function readableSource(sources: { url?: string }[] = []): string | null {
  return sources.find((s) => s.url && !RAW_DATA_URL.test(s.url))?.url ?? null;
}

type EonetEvent = {
  id: string;
  title: string;
  link: string | null;
  sources?: { id: string; url?: string }[];
  categories: { id: string; title: string }[];
  geometry: {
    date: string;
    type: string;
    coordinates: number[] | number[][][];
  }[];
};

function isValid([lng, lat]: [number, number]): boolean {
  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

// EONET mezcla convenciones: los Point vienen [lng, lat] (estándar) pero los
// Polygon vienen [lat, lng]. Aquí siempre se devuelve [lng, lat].
function firstPoint(
  geometry: EonetEvent["geometry"][number],
): [number, number] | null {
  const coords = geometry.coordinates;

  if (geometry.type === "Point" && typeof coords[0] === "number") {
    const point: [number, number] = [coords[0], coords[1] as number];
    return isValid(point) ? point : null;
  }

  const ring = (coords as number[][][])[0]?.[0];
  if (!Array.isArray(ring)) return null;
  const point: [number, number] = [ring[1], ring[0]];
  return isValid(point) ? point : null;
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
    url: readableSource(event.sources),
    occurredAt: new Date(latest.date),
    tsunami: false,
  };
}

export async function fetchNaturalEvents(
  days: number,
): Promise<HazardInsert[]> {
  const params = new URLSearchParams({ days: String(days), status: "all" });
  const res = await fetch(`${EONET_URL}?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`EONET HTTP ${res.status}`);

  const body = (await res.json()) as { events?: EonetEvent[] };
  return (body.events ?? []).flatMap((e) => {
    const hazard = toHazard(e);
    return hazard ? [hazard] : [];
  });
}
