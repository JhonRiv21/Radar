import type { HazardInsert } from "@/lib/types/hazard";

const USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";
const MIN_MAGNITUDE = 4.5;

type UsgsFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string | null;
    sig: number | null;
    alert: string | null;
    tsunami: number;
    title: string | null;
  };
  geometry: { coordinates: [number, number, number] };
};

function toHazard(feature: UsgsFeature): HazardInsert | null {
  const [lng, lat, depth] = feature.geometry.coordinates;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  return {
    externalId: `usgs:${feature.id}`,
    source: "usgs",
    kind: "earthquake",
    title: feature.properties.title ?? "Sismo",
    place: feature.properties.place,
    magnitude: feature.properties.mag,
    depthKm: depth ?? null,
    significance: feature.properties.sig,
    alert: feature.properties.alert,
    tsunami: feature.properties.tsunami === 1,
    lat,
    lng,
    url: feature.properties.url,
    occurredAt: new Date(feature.properties.time),
  };
}

export async function fetchEarthquakes(
  since: Date,
  until = new Date(),
): Promise<HazardInsert[]> {
  const params = new URLSearchParams({
    format: "geojson",
    starttime: since.toISOString(),
    endtime: until.toISOString(),
    minmagnitude: String(MIN_MAGNITUDE),
    orderby: "time",
  });

  const res = await fetch(`${USGS_URL}?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`USGS HTTP ${res.status}`);

  const body = (await res.json()) as { features?: UsgsFeature[] };
  return (body.features ?? []).flatMap((f) => {
    const hazard = toHazard(f);
    return hazard ? [hazard] : [];
  });
}
