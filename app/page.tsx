import { getRecentEvents, getCountryHotspots } from "@/lib/services/events";
import { getPipelineHealth } from "@/lib/services/health";
import { FreshnessPill } from "@/lib/components/freshness-pill";
import { RefreshButton } from "@/lib/components/refresh-button";
import { EventFeed } from "@/lib/components/event-feed";
import { EventMap } from "@/lib/components/event-map";
import { DbError } from "@/lib/components/db-error";
import { AutoRefresh } from "@/lib/components/auto-refresh";
import type {
  EventRow,
  CountryHotspot,
  PipelineHealth,
} from "@/lib/types/event";
import { refreshEvents } from "./actions";

export const dynamic = "force-dynamic";

const EMPTY_HEALTH: PipelineHealth = {
  level: "empty",
  lastSuccessAt: null,
  lastRunAt: null,
  error: null,
};

export default async function Home() {
  let events: EventRow[] = [];
  let hotspots: CountryHotspot[] = [];
  let health: PipelineHealth = EMPTY_HEALTH;
  let error: string | null = null;

  try {
    [events, hotspots, health] = await Promise.all([
      getRecentEvents(),
      getCountryHotspots(),
      getPipelineHealth(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error de base de datos";
  }

  const totalEvents = hotspots.reduce((sum, h) => sum + h.count, 0);

  return (
    <div className="min-h-full">
      <AutoRefresh />
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
            <FreshnessPill health={health} />
            <form action={refreshEvents}>
              <RefreshButton />
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {error ? (
          <DbError message={error} />
        ) : (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-lg border border-border bg-panel">
              <div className="flex items-center justify-between border-b border-border px-5 py-3 text-xs text-muted">
                <span>Actividad por país</span>
                <span>
                  {hotspots.length} países · {totalEvents} eventos
                </span>
              </div>
              <EventMap hotspots={hotspots} />
            </section>
            <EventFeed events={events} />
          </div>
        )}
      </main>
    </div>
  );
}
