"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// En desarrollo se desactiva: pelea con el hot reload y encola recompilaciones.
const ENABLED = process.env.NODE_ENV === "production";

export function AutoRefresh({ intervalMs = 60000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    if (!ENABLED) return;
    const id = setInterval(() => {
      // Sin pestaña visible no tiene sentido refrescar ni gastar conexiones.
      if (!document.hidden) router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
