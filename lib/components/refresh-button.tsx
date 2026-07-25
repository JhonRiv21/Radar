"use client";

import { useFormStatus } from "react-dom";

export function RefreshButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="glass-soft rounded-md px-3 py-1.5 text-sm transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Actualizando…" : "Actualizar ahora"}
    </button>
  );
}
