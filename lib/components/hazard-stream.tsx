"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { fetchHazardsPage } from "@/app/actions";
import { HazardCard } from "@/lib/components/hazard-card";
import {
  useHazardFilter,
  RANGE_OPTIONS,
} from "@/lib/components/hazard-filter";
import type { HazardRow, HazardFilters } from "@/lib/types/hazard";

export function HazardStream({
  initial,
  total,
}: {
  initial: HazardRow[];
  total: number;
}) {
  const { kinds, country, range } = useHazardFilter();
  const rangeLabel =
    RANGE_OPTIONS.find((o) => o.value === range)?.label ?? "";
  const [items, setItems] = useState(initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [refiltering, startRefilter] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const busyRef = useRef(false);

  const filters: HazardFilters = {
    kinds: [...kinds],
    country: country === "all" ? null : country,
    days: range,
  };
  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    startRefilter(async () => {
      const rows = await fetchHazardsPage(1, JSON.parse(filterKey));
      pageRef.current = 1;
      setItems(rows);
      setExhausted(rows.length === 0);
    });
  }, [filterKey]);

  const loadMore = useCallback(async () => {
    if (busyRef.current || exhausted) return;
    busyRef.current = true;
    setLoadingMore(true);
    try {
      const next = await fetchHazardsPage(
        pageRef.current + 1,
        JSON.parse(filterKey),
      );
      if (next.length) {
        pageRef.current += 1;
        setItems((prev) => [...prev, ...next]);
      } else {
        setExhausted(true);
      }
    } finally {
      setLoadingMore(false);
      busyRef.current = false;
    }
  }, [filterKey, exhausted]);

  const loading = loadingMore || refiltering;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section className="glass flex min-h-0 basis-3/5 flex-col rounded-xl">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-3 pt-4">
        <h2 className="text-sm font-medium">Últimos eventos</h2>
        <span className="text-xs text-muted">
          {items.length} de {total} · {rangeLabel}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((hazard) => (
            <HazardCard key={hazard.id} hazard={hazard} />
          ))}
        </div>

        {items.length === 0 && !loading && (
          <p className="py-6 text-center text-xs text-muted">
            Sin eventos para este filtro.
          </p>
        )}

        {!exhausted ? (
          <div ref={sentinelRef} className="pt-4 text-center text-xs text-muted">
            {loading ? "Cargando más eventos…" : " "}
          </div>
        ) : (
          items.length > 0 && (
            <p className="pt-4 text-center text-xs text-muted">
              {items.length} eventos · fin del historial
            </p>
          )
        )}
      </div>
    </section>
  );
}
