import { Suspense } from "react";
import { RefreshButton } from "@/lib/components/refresh-button";
import { MapSection } from "@/lib/components/map-section";
import { TrendsSection } from "@/lib/components/trends-section";
import { EventsSection } from "@/lib/components/events-section";
import { HealthSection } from "@/lib/components/health-section";
import { AutoRefresh } from "@/lib/components/auto-refresh";
import { MapFocusProvider } from "@/lib/components/map-focus";
import { HazardFilterProvider } from "@/lib/components/hazard-filter";
import {
  TableSkeleton,
  MapSkeleton,
  PillSkeleton,
} from "@/lib/components/skeletons";
import { refreshEvents } from "./actions";

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

            <header className="pointer-events-auto shrink-0 px-4 pt-4">
              <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
                    <h1 className="text-lg font-semibold tracking-tight">
                      radar
                    </h1>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    Fenómenos naturales en tiempo real · USGS + NASA EONET
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Suspense fallback={<PillSkeleton />}>
                    <HealthSection />
                  </Suspense>
                  <form action={refreshEvents}>
                    <RefreshButton />
                  </form>
                </div>
              </div>
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
          </div>
        </div>
      </HazardFilterProvider>
    </MapFocusProvider>
  );
}
