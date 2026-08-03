import { timingSafeEqual } from "node:crypto";
import { runHazardIngest } from "@/lib/services/hazards";
import { cleanupOldData } from "@/lib/services/retention";

export const dynamic = "force-dynamic";

const INGEST_DAYS = 7;

function matches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || !auth || !matches(auth, `Bearer ${secret}`)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ingest = await runHazardIngest(INGEST_DAYS);
  if (!ingest.ok) return Response.json({ ingest }, { status: 500 });

  const retention = await cleanupOldData();
  return Response.json({ ingest, retention });
}
