import { runIngest } from "@/lib/services/gdelt";
import { cleanupOldData } from "@/lib/services/retention";

export const dynamic = "force-dynamic";

// Vercel Cron manda `Authorization: Bearer $CRON_SECRET`; un cron externo puede usar `?secret=`.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const qs = new URL(request.url).searchParams.get("secret");

  if (!secret || (auth !== `Bearer ${secret}` && qs !== secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ingest = await runIngest();
  if (!ingest.ok) return Response.json({ ingest }, { status: 500 });

  const retention = await cleanupOldData();
  return Response.json({ ingest, retention });
}
