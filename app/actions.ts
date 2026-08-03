"use server";

import { getHazardsPage } from "@/lib/services/hazards";
import { sanitizeFilters, sanitizePage } from "@/lib/utils/hazard-filters";
import type { HazardRow } from "@/lib/types/hazard";

export async function fetchHazardsPage(
  page: unknown,
  filters: unknown,
): Promise<HazardRow[]> {
  return await getHazardsPage(sanitizePage(page), sanitizeFilters(filters));
}
