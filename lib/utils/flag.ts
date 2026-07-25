import { COUNTRY_ISO } from "@/lib/assets/country-iso";
import { COUNTRY_ALIASES } from "@/lib/assets/country-centroids";

const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - 65;

export function countryFlag(country: string | null): string | null {
  if (!country) return null;
  const key = country.trim().toLowerCase();
  const iso = COUNTRY_ISO[COUNTRY_ALIASES[key] ?? key];
  if (!iso) return null;
  return String.fromCodePoint(
    ...[...iso].map((c) => c.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET),
  );
}
