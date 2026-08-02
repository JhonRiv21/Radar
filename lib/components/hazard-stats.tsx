"use client";

import { Sparkline } from "@/lib/components/sparkline";
import { HAZARD_KINDS } from "@/lib/assets/hazard-kinds";
import { computeStats } from "@/lib/utils/hazard-stats";
import { useHazardFilter, RangeSelector } from "@/lib/components/hazard-filter";
import { CountryCombobox } from "@/lib/components/country-combobox";
import { useI18n } from "@/lib/components/i18n";
import type { HazardPoint } from "@/lib/types/hazard";

export function HazardStats({
  points,
  countries,
}: {
  points: HazardPoint[];
  countries: string[];
}) {
  const { matchesKind, matchesScope, toggleKind, range } = useHazardFilter();
  const { t } = useI18n();

  // Se cuenta sobre país+rango, no sobre tipo: si no, cada tarjeta se anularía a sí misma.
  const stats = computeStats(points.filter(matchesScope), range);

  return (
    <section className="glass shrink-0 rounded-xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{t("stats.title")}</h2>
        <div className="flex items-center gap-2">
          <CountryCombobox countries={countries} />
          <RangeSelector />
        </div>
      </div>

      {stats.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted">
          {t("stats.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {stats.map((stat) => {
            const meta = HAZARD_KINDS[stat.kind];
            const label = t(`kind.${stat.kind}`);
            const dimmed = !matchesKind(stat.kind);
            return (
              <button
                key={stat.kind}
                type="button"
                onClick={() => toggleKind(stat.kind)}
                title={t("stats.filterBy", { label: label.toLowerCase() })}
                className={`surface cursor-pointer rounded-lg p-2.5 text-left transition-opacity ${
                  dimmed ? "opacity-40" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="truncate text-xs">{label}</span>
                </div>

                <div className="mt-1 flex items-end gap-2">
                  <p className="flex shrink-0 items-baseline gap-1">
                    <span className="font-mono text-lg leading-none">
                      {stat.count}
                    </span>
                    {stat.maxMagnitude !== null && (
                      <span className="text-xs text-muted">
                        M{stat.maxMagnitude.toFixed(1)}
                      </span>
                    )}
                  </p>
                  <div className="min-w-0 flex-1">
                    <Sparkline points={stat.series} color={meta.color} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
