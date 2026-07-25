import { Sparkline } from "@/lib/components/sparkline";
import type { TrendingTerm } from "@/lib/types/event";

const HOT = "#ff2e88";
const COOL = "#38bdf8";

export function TrendCard({ term }: { term: TrendingTerm }) {
  const isNew = term.baselineDaily < 0.5;
  const growth = Math.round((term.lift - 1) * 100);
  const showGrowth = !isNew && growth >= 20;
  const hot = isNew || growth >= 50;

  return (
    <article className="glass-soft rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-sm font-medium capitalize">
          {term.term}
        </span>
        {isNew ? (
          <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 text-xs font-medium uppercase text-accent">
            nuevo
          </span>
        ) : showGrowth ? (
          <span className="shrink-0 rounded bg-emerald-400/15 px-1.5 py-0.5 text-xs font-medium text-emerald-300">
            +{growth}%
          </span>
        ) : null}
      </div>

      <p className="mt-1 text-xs text-muted">menciones</p>

      <div className="flex items-end justify-between gap-3">
        <p className="flex items-baseline gap-1.5">
          <span className="font-mono text-xl leading-none">{term.recent}</span>
          <span className="text-xs text-emerald-300">
            ▲ {term.share.toFixed(1)}%
          </span>
        </p>
        <div className="w-24 shrink-0">
          <Sparkline points={term.series} color={hot ? HOT : COOL} />
        </div>
      </div>
    </article>
  );
}
