import { formatDateTime, timeAgo } from "@/lib/utils/date";
import type { IngestRun } from "@/lib/types/event";

const STATUS_COLOR: Record<string, string> = {
  ok: "bg-accent",
  error: "bg-red-400",
  running: "bg-amber-400",
};

export function FreshnessPill({ run }: { run: IngestRun | null }) {
  const color = run ? (STATUS_COLOR[run.status] ?? "bg-muted") : "bg-muted";
  const at = run?.finishedAt ?? run?.startedAt ?? null;
  const label = run ? `actualizado ${timeAgo(at)}` : "sin datos aún";

  return (
    <span
      title={at ? formatDateTime(at) : undefined}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1 text-xs text-muted"
    >
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
