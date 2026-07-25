import { getPipelineHealth } from "@/lib/services/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await getPipelineHealth();
    return Response.json(health, {
      status: health.level === "error" ? 503 : 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de base de datos";
    return Response.json({ level: "error", error: message }, { status: 503 });
  }
}
