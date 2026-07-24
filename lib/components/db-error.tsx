export function DbError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border bg-panel p-6">
      <p className="font-medium text-red-300">
        No hay conexión a la base de datos.
      </p>
      <p className="mt-2 text-sm text-muted">
        Copia <code className="text-accent">.env.example</code> a{" "}
        <code className="text-accent">.env.local</code>, pon tus credenciales de
        Supabase y corre <code className="text-accent">npm run db:push</code>.
      </p>
      <p className="mt-3 font-mono text-xs text-muted/70">{message}</p>
    </div>
  );
}
