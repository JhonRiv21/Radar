import { HAZARD_KINDS } from "@/lib/assets/hazard-kinds";
import type { HazardFilters, HazardKind } from "@/lib/types/hazard";

const ALLOWED_DAYS = [1, 15, 30];
const DEFAULT_DAYS = 30;
const MAX_PAGE = 200;
const MAX_COUNTRY_LENGTH = 60;

const VALID_KINDS = new Set(Object.keys(HAZARD_KINDS));

export function sanitizePage(value: unknown): number {
  const page = Math.trunc(Number(value));
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, MAX_PAGE);
}

export function sanitizeFilters(value: unknown): HazardFilters {
  const raw = (value ?? {}) as Partial<HazardFilters>;

  const kinds = Array.isArray(raw.kinds)
    ? raw.kinds.filter(
        (kind): kind is HazardKind =>
          typeof kind === "string" && VALID_KINDS.has(kind),
      )
    : [];

  const country =
    typeof raw.country === "string" &&
    raw.country.length > 0 &&
    raw.country.length <= MAX_COUNTRY_LENGTH
      ? raw.country
      : null;

  const days = ALLOWED_DAYS.includes(Number(raw.days))
    ? Number(raw.days)
    : DEFAULT_DAYS;

  return { kinds, country, days };
}
