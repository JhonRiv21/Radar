import { formatDateTime, timeAgo } from "@/lib/utils/date";
import type { EventRow } from "@/lib/types/event";

export function EventFeed({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-panel p-6 text-sm text-muted">
        Aún no hay eventos. Pulsa{" "}
        <span className="text-accent">«Actualizar ahora»</span> para traer datos de
        GDELT.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-panel">
      {events.map((event) => (
        <li
          key={event.id}
          className="px-5 py-4 transition-colors hover:bg-white/2"
        >
          <a
            href={event.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <p className="font-medium leading-snug">
              {event.title ?? "(sin título)"}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              {event.sourceDomain && (
                <span className="text-accent">{event.sourceDomain}</span>
              )}
              {event.country && <span>· {event.country}</span>}
              {event.lang && <span>· {event.lang}</span>}
              <span className="font-mono" title={formatDateTime(event.occurredAt)}>
                · {timeAgo(event.occurredAt)}
              </span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
