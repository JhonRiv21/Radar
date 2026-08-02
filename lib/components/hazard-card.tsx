"use client";

import { formatDateTime, timeAgo } from "@/lib/utils/date";
import { HAZARD_KINDS } from "@/lib/assets/hazard-kinds";
import { useMapFocus } from "@/lib/components/map-focus";
import { countryFlag } from "@/lib/components/country-combobox";
import { useI18n } from "@/lib/components/i18n";
import type { HazardRow, HazardKind } from "@/lib/types/hazard";

const ALERT_STYLES: Record<string, string> = {
  green: "text-emerald-300",
  yellow: "text-amber-300",
  orange: "text-orange-300",
  red: "text-red-300",
};

export function HazardCard({ hazard }: { hazard: HazardRow }) {
  const { focus, focusOn } = useMapFocus();
  const { t, lang } = useI18n();
  const meta = HAZARD_KINDS[hazard.kind as HazardKind];
  const label = t(`kind.${hazard.kind as HazardKind}`);
  const selected = focus?.eventId === hazard.id;

  return (
    <article
      onClick={() =>
        focusOn({
          lat: hazard.lat,
          lng: hazard.lng,
          country: hazard.place,
          eventId: hazard.id,
        })
      }
      title={t("card.showOnMap")}
      className={`surface flex cursor-pointer flex-col rounded-lg p-3 transition-all ${
        selected
          ? "border-accent/60 bg-accent/15 shadow-[0_0_0_1px_var(--accent)] ring-1 ring-accent/40"
          : "hover:border-white/20"
      }`}
    >
      <header className="flex items-center gap-2 text-xs">
        {hazard.country && (
          <span aria-hidden="true" title={hazard.country}>
            {countryFlag(hazard.country)}
          </span>
        )}
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 ${meta?.chip ?? ""}`}
        >
          {label}
        </span>
        {hazard.magnitude !== null && (
          <span className="font-mono text-sm font-semibold">
            M{hazard.magnitude.toFixed(1)}
          </span>
        )}
        {hazard.tsunami && (
          <span className="rounded bg-sky-400/15 px-1.5 py-0.5 text-cyan-200">
            {t("card.tsunami")}
          </span>
        )}
        {hazard.alert && (
          <span className={`ml-auto ${ALERT_STYLES[hazard.alert] ?? "text-muted"}`}>
            {t("card.alert", { level: hazard.alert })}
          </span>
        )}
      </header>

      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug">
        {hazard.place ?? hazard.title}
      </p>

      <footer className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-muted">
        <span className="font-mono" title={formatDateTime(hazard.occurredAt, lang)}>
          {timeAgo(hazard.occurredAt, lang)}
          {hazard.depthKm !== null && <span> · {Math.round(hazard.depthKm)} km</span>}
        </span>
        {hazard.url && (
          <a
            href={hazard.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 transition-colors hover:text-accent"
          >
            {t("card.detail")}
          </a>
        )}
      </footer>
    </article>
  );
}
