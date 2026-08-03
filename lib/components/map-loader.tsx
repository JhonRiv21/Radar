"use client";

import dynamic from "next/dynamic";
import { MapSkeleton } from "@/lib/components/skeletons";
import type { HazardPoint } from "@/lib/types/hazard";

const EventMap = dynamic(
  () => import("@/lib/components/event-map").then((m) => m.EventMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

export function MapLoader({ points }: { points: HazardPoint[] }) {
  return <EventMap points={points} />;
}
