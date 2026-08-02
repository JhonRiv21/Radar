"use server";

import { getHazardsPage } from "@/lib/services/hazards";
import type { HazardRow, HazardFilters } from "@/lib/types/hazard";

export async function fetchHazardsPage(
  page: number,
  filters: HazardFilters,
): Promise<HazardRow[]> {
  return await getHazardsPage(page, filters);
}
