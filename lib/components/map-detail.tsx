"use client";

import { HAZARD_KINDS } from "@/lib/assets/hazard-kinds";
import { timeAgo, formatDateTime } from "@/lib/utils/date";
import { countryFlag } from "@/lib/components/country-combobox";
import type { HazardPoint } from "@/lib/types/hazard";

export function MapDetail({
  point,
  onClose,
}: {
  point: HazardPoint;
  onClose: () => void;
}) {
  const meta = HAZARD_KINDS[point.kind];

  return (
    <aside className="glass absolute bottom-4 left-4 flex max-h-96 w-80 flex-col overflow-hidden rounded-xl lg:left-auto lg:right-4 lg:bottom-16">
      <header className="flex shrink-0 items-start gap-2 px-4 pb-2 pt-3 text-xs">
        {point.country && (
          <span aria-hidden="true" title={point.country}>
            {countryFlag(point.country)}
          </span>
        )}
        <span className={`rounded border px-1.5 py-0.5 ${meta.chip}`}>
          {meta.label}
        </span>
        {point.magnitude !== null && (
          <span className="font-mono text-sm font-semibold">
            M{point.magnitude.toFixed(1)}
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="ml-auto text-muted transition-colors hover:text-foreground"
        >
          ✕
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <p className="text-sm font-medium leading-snug">{point.title}</p>
        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
          <span className="font-mono" title={formatDateTime(point.occurredAt)}>
            {timeAgo(point.occurredAt)}
          </span>
          {point.url && (
            <a
              href={point.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 transition-colors hover:text-accent"
            >
              Ver detalle ›
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
