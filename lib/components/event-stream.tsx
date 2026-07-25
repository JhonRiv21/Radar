"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEventsPage } from "@/app/actions";
import { clusterEvents } from "@/lib/utils/cluster";
import { NewsCard } from "@/lib/components/news-card";
import type { EventRow } from "@/lib/types/event";

export function EventStream({
  initial,
  total,
}: {
  initial: EventRow[];
  total: number;
}) {
  const [events, setEvents] = useState(initial);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const busyRef = useRef(false);

  const hasMore = events.length < total;
  const clusters = clusterEvents(events);

  const loadMore = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    try {
      const next = await fetchEventsPage(pageRef.current + 1);
      if (next.length) {
        pageRef.current += 1;
        setEvents((prev) => [...prev, ...next]);
      }
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    // rootMargin adelanta la carga para que el scroll no se sienta cortado.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return (
    <section className="glass flex min-h-0 basis-3/5 flex-col rounded-xl">
      <h2 className="shrink-0 px-4 pb-3 pt-4 text-sm font-medium">
        Últimas noticias
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {clusters.map((cluster, index) => (
            <NewsCard key={cluster.lead.id} cluster={cluster} index={index + 1} />
          ))}
        </div>

        {hasMore ? (
          <div ref={sentinelRef} className="pt-4 text-center text-xs text-muted">
            {loading ? "Cargando más noticias…" : " "}
          </div>
        ) : (
          <p className="pt-4 text-center text-xs text-muted">
            {total} noticias · fin del historial
          </p>
        )}
      </div>
    </section>
  );
}
