import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Las migraciones van por el session pooler: el de transacciones no sostiene DDL.
  dbCredentials: { url: process.env.DIRECT_URL! },
});
