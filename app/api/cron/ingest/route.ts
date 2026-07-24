import { runIngest } from "@/lib/services/gdelt";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const qs = new URL(request.url).searchParams.get("secret");

  if (!secret || (auth !== `Bearer ${secret}` && qs !== secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runIngest();
  return Response.json(result, { status: result.ok ? 200 : 500 });
}
