"use server";

import { getHazardsPage, getHazardUrl } from "@/lib/services/hazards";
import { sanitizeFilters, sanitizePage } from "@/lib/utils/hazard-filters";
import type { HazardRow } from "@/lib/types/hazard";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchHazardsPage(
  page: unknown,
  filters: unknown,
): Promise<HazardRow[]> {
  return await getHazardsPage(sanitizePage(page), sanitizeFilters(filters));
}

export async function fetchHazardUrl(id: unknown): Promise<string | null> {
  if (typeof id !== "string" || !UUID.test(id)) return null;
  return await getHazardUrl(id);
}
