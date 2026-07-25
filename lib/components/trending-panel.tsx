import { TrendCard } from "@/lib/components/trend-card";
import type { TrendingTerm } from "@/lib/types/event";

export function TrendingPanel({ terms }: { terms: TrendingTerm[] }) {
  if (terms.length === 0) return null;

  return (
    <section className="glass flex min-h-0 basis-2/5 flex-col rounded-xl">
      <h2 className="shrink-0 px-4 pb-3 pt-4 text-sm font-medium">
        Tendencias principales · 24h
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {terms.map((term) => (
            <TrendCard key={term.term} term={term} />
          ))}
        </div>
      </div>
    </section>
  );
}
