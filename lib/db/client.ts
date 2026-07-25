import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { events, ingestRuns } from "./schema";

const globalForDb = globalThis as unknown as {
  pg?: ReturnType<typeof postgres>;
};

// prepare:false: compatible con el pooler de Supabase (session o transaction).
const client =
  globalForDb.pg ?? postgres(process.env.DATABASE_URL ?? "", { prepare: false });

if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema: { events, ingestRuns } });
