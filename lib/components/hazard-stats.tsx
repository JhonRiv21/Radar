"use client";

import { Sparkline } from "@/lib/components/sparkline";
import { HAZARD_KINDS } from "@/lib/assets/hazard-kinds";
import { computeStats } from "@/lib/utils/hazard-stats";
import {
  useHazardFilter,
  KindChips,
  RangeSelector,
} from "@/lib/components/hazard-filter";
import { CountryCombobox } from "@/lib/components/country-combobox";
import type { HazardPoint } from "@/lib/types/hazard";

export function HazardStats({
  points,
  countries,
}: {
  points: HazardPoint[];
  countries: string[];
}) {
  const { matchesKind, matchesScope, toggleKind, range } = useHazardFilter();
  const stats = computeStats(points.filter(matchesScope), range);

  return (
    <section className="glass flex min-h-0 basis-2/5 flex-col rounded-xl">
      <div className="shrink-0 space-y-3 px-4 pb-3 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium">Actividad natural</h2>
          <div className="flex items-center gap-2">
            <CountryCombobox countries={countries} />
            <RangeSelector />
          </div>
        </div>
        <KindChips />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => {
            const meta = HAZARD_KINDS[stat.kind];
            const dimmed = !matchesKind(stat.kind);
            return (
              <button
                key={stat.kind}
                type="button"
                onClick={() => toggleKind(stat.kind)}
                className={`surface rounded-lg p-3 text-left transition-opacity ${
                  dimmed ? "opacity-40" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="truncate text-sm font-medium">
                    {meta.label}
                  </span>
                </div>

                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="flex items-baseline gap-1.5">
                    <span className="font-mono text-xl leading-none">
                      {stat.count}
                    </span>
                    {stat.maxMagnitude !== null && (
                      <span className="text-xs text-muted">
                        máx M{stat.maxMagnitude.toFixed(1)}
                      </span>
                    )}
                  </p>
                  <div className="w-24 shrink-0">
                    <Sparkline points={stat.series} color={meta.color} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {stats.length === 0 && (
          <p className="py-6 text-center text-xs text-muted">
            Sin eventos para este filtro.
          </p>
        )}
      </div>
    </section>
  );
}
