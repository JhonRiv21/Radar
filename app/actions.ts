"use server";

import { revalidatePath } from "next/cache";
import { runIngest } from "@/lib/services/gdelt";

export async function refreshEvents() {
  await runIngest();
  revalidatePath("/");
}
