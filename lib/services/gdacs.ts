import type { HazardInsert } from "@/lib/types/hazard";

const GDACS_URL =
  "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH";

type GdacsFeature = {
  properties: {
    eventid: number | string;
    country?: string;
    fromdate?: string;
    todate?: string;
    alertlevel?: string;
    url?: { report?: string };
  };
  geometry: { coordinates: [number, number] };
};

function firstCountry(list?: string): string | null {
  return list?.split(",")[0]?.trim() || null;
}

// Las sequías son eventos en curso: la fecha útil es el último reporte, no el inicio.
function latestDate(props: GdacsFeature["properties"]): Date | null {
  const raw = props.todate ?? props.fromdate;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toHazard(feature: GdacsFeature): HazardInsert | null {
  const [lng, lat] = feature.geometry?.coordinates ?? [];
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  const occurredAt = latestDate(feature.properties);
  if (!occurredAt) return null;

  const country = firstCountry(feature.properties.country);

  return {
    externalId: `gdacs:DR:${feature.properties.eventid}`,
    source: "gdacs",
    kind: "drought",
    title: country ? `Drought in ${feature.properties.country}` : "Drought",
    place: feature.properties.country ?? null,
    alert: feature.properties.alertlevel?.toLowerCase() ?? null,
    tsunami: false,
    lat,
    lng,
    url: feature.properties.url?.report ?? null,
    occurredAt,
  };
}

export async function fetchDroughts(): Promise<HazardInsert[]> {
  const params = new URLSearchParams({ eventlist: "DR" });
  const res = await fetch(`${GDACS_URL}?${params}`, {
    headers: { "user-agent": "radar.riverogz.com" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GDACS HTTP ${res.status}`);

  const body = (await res.json()) as { features?: GdacsFeature[] };
  return (body.features ?? []).flatMap((f) => {
    const hazard = toHazard(f);
    return hazard ? [hazard] : [];
  });
}
