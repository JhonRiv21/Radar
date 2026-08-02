import { Suspense } from "react";
import { cookies } from "next/headers";
import { MapSection } from "@/lib/components/map-section";
import { TrendsSection } from "@/lib/components/trends-section";
import { EventsSection } from "@/lib/components/events-section";
import { HealthSection } from "@/lib/components/health-section";
import { TickerSection } from "@/lib/components/ticker-section";
import { AutoRefresh } from "@/lib/components/auto-refresh";
import { MapFocusProvider } from "@/lib/components/map-focus";
import { I18nProvider, LanguageSelector } from "@/lib/components/i18n";
import { LANG_COOKIE, parseLang } from "@/lib/assets/i18n";
import { BrandTagline, CreditLabel } from "@/lib/components/brand";
import { HazardFilterProvider } from "@/lib/components/hazard-filter";
import {
  PanelProvider,
  PanelToggle,
  PanelDrawer,
} from "@/lib/components/panel-drawer";
import {
  TableSkeleton,
  MapSkeleton,
  PillSkeleton,
} from "@/lib/components/skeletons";

export const dynamic = "force-dynamic";

export default async function Home() {
  // El idioma se resuelve en servidor para que el HTML ya venga en el idioma correcto.
  const lang = parseLang((await cookies()).get(LANG_COOKIE)?.value);

  return (
    <I18nProvider initialLang={lang}>
      <MapFocusProvider>
        <HazardFilterProvider>
          <PanelProvider>
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
                  <div className="flex items-center gap-2">
                    <PanelToggle />
                    <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
                      <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
                      <span className="text-sm font-semibold tracking-tight">
                        Radar
                      </span>
                      <BrandTagline />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LanguageSelector />
                    <Suspense fallback={<PillSkeleton />}>
                      <HealthSection />
                    </Suspense>
                  </div>
                </header>

                <div className="relative flex min-h-0 flex-1">
                  <PanelDrawer>
                    <Suspense fallback={null}>
                      <TrendsSection />
                    </Suspense>
                    <Suspense fallback={<TableSkeleton />}>
                      <EventsSection />
                    </Suspense>
                  </PanelDrawer>
                </div>

                <div className="shrink-0">
                  <div className="flex justify-end px-3">
                    <a
                      href="https://jhon.riverogz.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto text-xs text-gray-500 transition-colors hover:text-accent"
                    >
                      <CreditLabel />{" "}
                      <span className="font-medium">Jhon Rivero</span>
                    </a>
                  </div>
                  <Suspense fallback={null}>
                    <TickerSection />
                  </Suspense>
                </div>
              </div>
            </div>
          </PanelProvider>
        </HazardFilterProvider>
      </MapFocusProvider>
    </I18nProvider>
  );
}
