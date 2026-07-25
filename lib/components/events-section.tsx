import { getEventsPage, getEventsCount } from "@/lib/services/events";
import { EventStream } from "@/lib/components/event-stream";
import { DbError } from "@/lib/components/db-error";
import type { EventRow } from "@/lib/types/event";

export async function EventsSection() {
  let events: EventRow[];
  let total: number;
  try {
    [events, total] = await Promise.all([getEventsPage(1), getEventsCount()]);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error de base de datos";
    return <DbError message={message} />;
  }

  return <EventStream initial={events} total={total} />;
}
