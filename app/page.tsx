import { getRecentEvents, getLastRun } from "@/lib/services/events";
import { FreshnessPill } from "@/lib/components/freshness-pill";
import { EventFeed } from "@/lib/components/event-feed";
import { DbError } from "@/lib/components/db-error";
import type { EventRow, IngestRun } from "@/lib/types/event";
import { refreshEvents } from "./actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  let events: EventRow[] = [];
  let lastRun: IngestRun | null = null;
  let error: string | null = null;

  try {
    [events, lastRun] = await Promise.all([getRecentEvents(), getLastRun()]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error de base de datos";
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
              <h1 className="text-xl font-semibold tracking-tight">radar</h1>
            </div>
            <p className="mt-1 text-sm text-muted">
              Pulso de noticias del mundo en tiempo real · GDELT
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FreshnessPill run={lastRun} />
            <form action={refreshEvents}>
              <button
                type="submit"
                className="rounded-md border border-border bg-panel px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
              >
                Actualizar ahora
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {error ? <DbError message={error} /> : <EventFeed events={events} />}
      </main>
    </div>
  );
}
