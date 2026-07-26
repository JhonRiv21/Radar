import type { hazards } from "@/lib/db/schema";

export type HazardRow = typeof hazards.$inferSelect;
export type HazardInsert = typeof hazards.$inferInsert;

export type HazardKind =
  | "earthquake"
  | "wildfire"
  | "flood"
  | "storm"
  | "volcano"
  | "ice";

export type HazardPoint = {
  id: string;
  lat: number;
  lng: number;
  kind: HazardKind;
  magnitude: number | null;
  title: string;
  country: string | null;
  occurredAt: Date;
  url: string | null;
};

export type HazardFilters = {
  kinds: HazardKind[];
  country: string | null;
  days: number;
};

export type HazardStat = {
  kind: HazardKind;
  count: number;
  maxMagnitude: number | null;
  series: number[];
};

export type GeoJsonFeature = {
  id?: string;
  properties: Record<string, unknown>;
  geometry: { coordinates: number[] };
};
