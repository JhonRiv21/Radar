"use server";

import { revalidatePath } from "next/cache";
import { runIngest } from "@/lib/services/gdelt";
import { getEventsPage } from "@/lib/services/events";
import type { EventRow } from "@/lib/types/event";

export async function refreshEvents() {
  await runIngest();
  revalidatePath("/");
}

export async function fetchEventsPage(page: number): Promise<EventRow[]> {
  return await getEventsPage(page);
}
