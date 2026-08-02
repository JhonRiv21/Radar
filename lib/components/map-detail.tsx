"use client";

import { HAZARD_KINDS } from "@/lib/assets/hazard-kinds";
import { timeAgo, formatDateTime } from "@/lib/utils/date";
import { countryFlag } from "@/lib/components/country-combobox";
import { useI18n } from "@/lib/components/i18n";
import type { HazardPoint } from "@/lib/types/hazard";

export function MapDetail({
  point,
  onClose,
}: {
  point: HazardPoint;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const meta = HAZARD_KINDS[point.kind];
  const label = t(`kind.${point.kind}`);

  // En móvil se ancla entre ambos bordes y por encima de la tira y el crédito.
  return (
    <aside className="glass absolute bottom-20 left-4 right-4 flex max-h-80 flex-col overflow-hidden rounded-xl lg:left-auto lg:right-4 lg:w-80">
      <header className="flex shrink-0 items-start gap-2 px-4 pb-2 pt-3 text-xs">
        {point.country && (
          <span aria-hidden="true" title={point.country}>
            {countryFlag(point.country)}
          </span>
        )}
        <span className={`rounded border px-1.5 py-0.5 ${meta.chip}`}>
          {label}
        </span>
        {point.magnitude !== null && (
          <span className="font-mono text-sm font-semibold">
            M{point.magnitude.toFixed(1)}
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("map.close")}
          className="ml-auto cursor-pointer text-muted transition-colors hover:text-foreground"
        >
          ✕
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <p className="text-sm font-medium leading-snug">{point.title}</p>
        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
          <span className="font-mono" title={formatDateTime(point.occurredAt, lang)}>
            {timeAgo(point.occurredAt, lang)}
          </span>
          {point.url && (
            <a
              href={point.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 transition-colors hover:text-accent"
            >
              {t("card.detail")}
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
