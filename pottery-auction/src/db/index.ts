import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Postgres connection (self-hosted in a Docker container on the Hetzner box).
// Replaces the three Supabase clients. RLS no longer applies — every query runs
// with full privileges, so ownership/admin checks MUST live in the API layer.

function resolveConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL must be set in production");
  }
  // Local dev fallback matches docker-compose's postgres service defaults.
  return "postgres://tors:tors@localhost:5432/torsbored";
}

// globalThis guard prevents exhausting connections during Next.js dev hot-reload.
const globalForDb = globalThis as typeof globalThis & {
  _torsClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb._torsClient ?? postgres(resolveConnectionString(), { max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb._torsClient = client;

export const db = drizzle(client, { schema });
export { schema };
