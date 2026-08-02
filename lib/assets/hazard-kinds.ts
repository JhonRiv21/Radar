import type { HazardKind } from "@/lib/types/hazard";

export type KindMeta = {
  color: string;
  chip: string;
};

export const HAZARD_KINDS: Record<HazardKind, KindMeta> = {
  earthquake: {
    color: "#ff2e88",
    chip: "text-pink-300 border-pink-400/30 bg-pink-400/10",
  },
  wildfire: {
    color: "#ff8a1a",
    chip: "text-orange-300 border-orange-400/30 bg-orange-400/10",
  },
  flood: {
    color: "#38bdf8",
    chip: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  },
  storm: {
    color: "#a78bfa",
    chip: "text-violet-300 border-violet-400/30 bg-violet-400/10",
  },
  volcano: {
    color: "#f43f5e",
    chip: "text-rose-300 border-rose-400/30 bg-rose-400/10",
  },
  drought: {
    color: "#facc15",
    chip: "text-yellow-300 border-yellow-400/30 bg-yellow-400/10",
  },
  ice: {
    color: "#bae6fd",
    chip: "text-cyan-200 border-cyan-300/30 bg-cyan-300/10",
  },
};

export const KIND_ORDER: HazardKind[] = [
  "earthquake",
  "wildfire",
  "flood",
  "storm",
  "volcano",
  "drought",
  "ice",
];
