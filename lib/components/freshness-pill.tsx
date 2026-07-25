import { formatDateTime, timeAgo } from "@/lib/utils/date";
import type { PipelineHealth } from "@/lib/types/event";

const STYLES: Record<PipelineHealth["level"], { dot: string; text: string }> = {
  fresh: { dot: "bg-emerald-400", text: "text-muted" },
  stale: { dot: "bg-amber-400", text: "text-amber-300" },
  error: { dot: "bg-red-400", text: "text-red-300" },
  empty: { dot: "bg-muted", text: "text-muted" },
};

function label(health: PipelineHealth): string {
  if (health.level === "empty") return "sin datos aún";
  if (health.level === "error") return "fallo al actualizar";
  const prefix = health.level === "stale" ? "desactualizado" : "actualizado";
  return `${prefix} ${timeAgo(health.lastSuccessAt ?? health.lastRunAt)}`;
}

export function FreshnessPill({ health }: { health: PipelineHealth }) {
  const style = STYLES[health.level];
  const at = health.lastSuccessAt ?? health.lastRunAt;
  const tooltip = health.error ?? (at ? formatDateTime(at) : undefined);

  return (
    <span
      title={tooltip}
      className={`glass-soft inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${style.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {label(health)}
    </span>
  );
}
