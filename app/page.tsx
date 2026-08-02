import { Suspense } from "react";
import { MapSection } from "@/lib/components/map-section";
import { TrendsSection } from "@/lib/components/trends-section";
import { EventsSection } from "@/lib/components/events-section";
import { HealthSection } from "@/lib/components/health-section";
import { TickerSection } from "@/lib/components/ticker-section";
import { AutoRefresh } from "@/lib/components/auto-refresh";
import { MapFocusProvider } from "@/lib/components/map-focus";
import { HazardFilterProvider } from "@/lib/components/hazard-filter";
import {
  TableSkeleton,
  MapSkeleton,
  PillSkeleton,
} from "@/lib/components/skeletons";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <MapFocusProvider>
      <HazardFilterProvider>
        <div className="relative h-dvh overflow-hidden">
          {/* El globo ocupa toda la pantalla; los paneles de vidrio flotan encima. */}
          <div className="absolute inset-0">
            <Suspense fallback={<MapSkeleton />}>
              <MapSection />
            </Suspense>
          </div>

          <div className="pointer-events-none relative z-10 flex h-full flex-col">
            <AutoRefresh />

            <header className="pointer-events-auto flex shrink-0 items-center justify-between gap-3 px-4 pt-4">
              <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
                <span className="text-sm font-semibold tracking-tight">
                  Radar
                </span>
                <span className="hidden text-xs text-muted sm:inline">
                  · fenómenos naturales
                </span>
              </div>
              <Suspense fallback={<PillSkeleton />}>
                <HealthSection />
              </Suspense>
            </header>

            <div className="flex min-h-0 flex-1">
              <div className="pointer-events-auto flex w-full min-h-0 flex-col gap-4 p-4 lg:w-2/5">
                <Suspense fallback={null}>
                  <TrendsSection />
                </Suspense>
                <Suspense fallback={<TableSkeleton />}>
                  <EventsSection />
                </Suspense>
              </div>
            </div>

            <div className="shrink-0">
              <div className="flex justify-end px-3">
                <a
                  href="https://jhon.riverogz.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto text-xs text-gray-500 transition-colors hover:text-accent"
                >
                  Desarrollado por{" "}
                  <span className="font-medium">
                    Jhon Rivero
                  </span>
                </a>
              </div>
              <Suspense fallback={null}>
                <TickerSection />
              </Suspense>
            </div>
          </div>
        </div>
      </HazardFilterProvider>
    </MapFocusProvider>
  );
}
