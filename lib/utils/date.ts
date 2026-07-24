const DEFAULT_TIMEZONE = "America/Bogota";
const LOCALE = "es-CO";

export function getSystemTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatDateTime(
  date: Date | null,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function timeAgo(date: Date | null): string {
  if (!date) return "—";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `hace ${seconds}s`;
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
  return `hace ${Math.floor(seconds / 86400)}d`;
}
