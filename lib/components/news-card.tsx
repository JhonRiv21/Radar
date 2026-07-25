"use client";

import { formatDateTime, timeAgo } from "@/lib/utils/date";
import { classify } from "@/lib/utils/text";
import { countryFlag } from "@/lib/utils/flag";
import { useMapFocus } from "@/lib/components/map-focus";
import type { EventCluster } from "@/lib/types/event";

export function NewsCard({
  cluster,
  index,
}: {
  cluster: EventCluster;
  index: number;
}) {
  const { lead, coverage, sources } = cluster;
  const { focus, focusOn } = useMapFocus();

  const category = classify(lead.title);
  const flag = countryFlag(lead.country);
  const locatable = lead.lat !== null && lead.lng !== null;
  const selected = focus?.eventId === lead.id;

  return (
    <article
      onClick={
        locatable
          ? () =>
              focusOn({
                lat: lead.lat as number,
                lng: lead.lng as number,
                country: lead.country,
                eventId: lead.id,
              })
          : undefined
      }
      title={locatable ? "Ver en el mapa" : undefined}
      className={`glass-soft flex flex-col rounded-lg p-3 transition-colors ${
        selected ? "border-accent/50 bg-accent/10" : "hover:border-white/20"
      } ${locatable ? "cursor-pointer" : ""}`}
    >
      <header className="flex items-center gap-2 text-xs text-muted">
        <span className="font-mono">#{index}</span>
        {flag && <span aria-hidden="true">{flag}</span>}
        <span className="truncate">{lead.country ?? "—"}</span>
        {category && (
          <span
            className={`ml-auto shrink-0 rounded border px-1.5 py-0.5 ${category.color}`}
          >
            {category.label}
          </span>
        )}
      </header>

      <p className="mt-2 line-clamp-3 text-sm font-medium leading-snug">
        {lead.title ?? "(sin título)"}
      </p>

      {lead.sourceDomain && (
        <p className="mt-1 truncate text-xs text-accent">{lead.sourceDomain}</p>
      )}

      <footer className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-muted">
        <span className="font-mono" title={formatDateTime(lead.occurredAt)}>
          {timeAgo(lead.occurredAt)}
          {coverage > 1 && (
            <span title={sources.join(", ")}> · +{coverage - 1} medios</span>
          )}
        </span>
        <a
          href={lead.url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 transition-colors hover:text-accent"
        >
          Ir a la noticia ›
        </a>
      </footer>
    </article>
  );
}
