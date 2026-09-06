const CARDS = 10;

export function TableSkeleton() {
  return (
    <div className="glass flex min-h-0 flex-1 animate-pulse flex-col overflow-hidden rounded-xl p-4">
      <div className="mb-3 h-3.5 w-32 shrink-0 rounded bg-white/10" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: CARDS }, (_, i) => (
          <div key={i} className="surface space-y-2 rounded-lg p-3">
            <div className="h-2.5 w-24 rounded bg-white/5" />
            <div className="h-3.5 w-full rounded bg-white/10" />
            <div className="h-3.5 w-3/4 rounded bg-white/10" />
            <div className="h-2.5 w-20 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return <div className="h-full w-full animate-pulse bg-white/[0.03]" />;
}
