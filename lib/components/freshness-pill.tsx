"use client";

import { formatDateTime, timeAgo } from "@/lib/utils/date";
import { useI18n } from "@/lib/components/i18n";
import type { PipelineHealth } from "@/lib/types/event";

const STYLES: Record<PipelineHealth["level"], { dot: string; text: string }> = {
  fresh: { dot: "bg-emerald-400", text: "text-muted" },
  stale: { dot: "bg-amber-400", text: "text-amber-300" },
  error: { dot: "bg-red-400", text: "text-red-300" },
  empty: { dot: "bg-muted", text: "text-muted" },
};

export function FreshnessPill({ health }: { health: PipelineHealth }) {
  const { t, lang } = useI18n();
  const style = STYLES[health.level];

  const label = () => {
    if (health.level === "empty") return t("health.empty");
    if (health.level === "error") return t("health.error");
    const when = timeAgo(health.lastSuccessAt ?? health.lastRunAt, lang);
    return `${t(health.level === "stale" ? "health.stale" : "health.fresh")} ${when}`;
  };
  const at = health.lastSuccessAt ?? health.lastRunAt;
  const tooltip = health.error ?? (at ? formatDateTime(at, lang) : undefined);

  return (
    <span
      title={tooltip}
      className={`glass-soft inline-flex items-center gap-2 rounded-full px-1 sm:px-3 py-1 text-[10px] sm:text-xs ${style.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {label()}
    </span>
  );
}
