import { KIND_ORDER } from "@/lib/assets/hazard-kinds";
import type { HazardPoint, HazardStat, HazardKind } from "@/lib/types/hazard";

const BUCKETS = 14;

export function computeStats(
  points: HazardPoint[],
  days: number,
): HazardStat[] {
  const now = Date.now();
  const windowMs = days * 24 * 60 * 60 * 1000;
  const bucketMs = windowMs / BUCKETS;

  const acc = new Map<
    HazardKind,
    { count: number; maxMagnitude: number | null; series: number[] }
  >();

  for (const point of points) {
    const entry = acc.get(point.kind) ?? {
      count: 0,
      maxMagnitude: null,
      series: Array<number>(BUCKETS).fill(0),
    };
    entry.count++;
    if (point.magnitude !== null) {
      entry.maxMagnitude = Math.max(entry.maxMagnitude ?? 0, point.magnitude);
    }
    const age = now - new Date(point.occurredAt).getTime();
    const bucket = Math.min(BUCKETS - 1, Math.floor(age / bucketMs));
    entry.series[BUCKETS - 1 - bucket]++;
    acc.set(point.kind, entry);
  }

  return KIND_ORDER.flatMap((kind) => {
    const entry = acc.get(kind);
    return entry ? [{ kind, ...entry }] : [];
  }).sort((a, b) => b.count - a.count);
}
