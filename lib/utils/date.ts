import { LOCALES, type Lang } from "@/lib/assets/i18n";

const DEFAULT_TIMEZONE = "America/Bogota";

export function formatDateTime(
  date: Date | null,
  lang: Lang = "en",
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat(LOCALES[lang], {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

// "hace 3h" / "3h ago": el orden del adverbio cambia según el idioma.
export function timeAgo(date: Date | null, lang: Lang = "en"): string {
  if (!date) return "—";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  const amount =
    seconds < 60
      ? `${seconds}s`
      : seconds < 3600
        ? `${Math.floor(seconds / 60)}m`
        : seconds < 86400
          ? `${Math.floor(seconds / 3600)}h`
          : `${Math.floor(seconds / 86400)}d`;

  return lang === "es" ? `hace ${amount}` : `${amount} ago`;
}
