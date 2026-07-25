"use client";

import { useFormStatus } from "react-dom";

export function RefreshButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-border bg-panel px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Actualizando…" : "Actualizar ahora"}
    </button>
  );
}
