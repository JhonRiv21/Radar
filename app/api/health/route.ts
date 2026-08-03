import { getPipelineHealth } from "@/lib/services/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await getPipelineHealth();
    return Response.json(health, {
      status: health.level === "error" ? 503 : 200,
    });
  } catch (err) {
    console.error("[api/health] fallo al leer el estado del pipeline", err);
    return Response.json({ level: "error" }, { status: 503 });
  }
}
