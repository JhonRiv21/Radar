"use client";

import { HAZARD_KINDS } from "@/lib/assets/hazard-kinds";
import { timeAgo } from "@/lib/utils/date";
import { useHazardFilter } from "@/lib/components/hazard-filter";
import { useMapFocus } from "@/lib/components/map-focus";
import { useI18n } from "@/lib/components/i18n";
import type { HazardPoint } from "@/lib/types/hazard";

const MAX_ITEMS = 40;
// Segundos por evento: fija la velocidad de lectura sin importar cuántos haya.
const SECONDS_PER_ITEM = 7;

export function EventTicker({ points }: { points: HazardPoint[] }) {
  const { isVisible } = useHazardFilter();
  const { focusOn } = useMapFocus();
  const { t, lang } = useI18n();

  const recent = points
    .filter((p) =>
      isVisible({ kind: p.kind, country: p.country, occurredAt: p.occurredAt }),
    )
    .slice(0, MAX_ITEMS);

  if (recent.length === 0) return null;

  // Se duplica la lista para que el bucle de la animación no muestre un corte.
  const loop = [...recent, ...recent];

  return (
    <div className="pointer-events-auto flex items-center gap-3 overflow-hidden border-t border-white/10 bg-black px-4 py-2.5">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        {t("map.live")}
      </span>

      <div className="ticker-mask min-w-0 flex-1">
        <div
          className="ticker-track flex w-max items-center gap-6"
          style={{ animationDuration: `${recent.length * SECONDS_PER_ITEM}s` }}
        >
          {loop.map((point, index) => {
            const meta = HAZARD_KINDS[point.kind];
            return (
              <button
                key={`${point.id}-${index}`}
                type="button"
                onClick={() =>
                  focusOn({
                    lat: point.lat,
                    lng: point.lng,
                    country: point.country,
                    eventId: point.id,
                  })
                }
                className="flex shrink-0 cursor-pointer items-center gap-2 text-xs transition-colors hover:text-accent"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                {point.magnitude !== null && (
                  <span className="font-mono font-semibold">
                    M{point.magnitude.toFixed(1)}
                  </span>
                )}
                <span className="max-w-80 truncate">{point.title}</span>
                <span className="font-mono text-muted">
                  {timeAgo(point.occurredAt, lang)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
