"use server";

import { revalidatePath } from "next/cache";
import { ingestHazards, getHazardsPage } from "@/lib/services/hazards";
import type { HazardRow, HazardFilters } from "@/lib/types/hazard";

const REFRESH_DAYS = 7;

export async function refreshEvents() {
  await ingestHazards(REFRESH_DAYS);
  revalidatePath("/");
}

export async function fetchHazardsPage(
  page: number,
  filters: HazardFilters,
): Promise<HazardRow[]> {
  return await getHazardsPage(page, filters);
}
