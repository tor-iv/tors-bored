// Standalone migration runner (run with `bun run src/db/migrate.ts`).
// 1. Applies drizzle-kit table migrations from ./drizzle.
// 2. Applies the PL/pgSQL functions (src/db/functions.sql) — Drizzle can't
//    express these, so they're applied as raw SQL afterward.
// Imports nothing from the Next bundle so it runs as a plain node/bun process.

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL ?? "postgres://tors:tors@localhost:5432/torsbored";

const sql = postgres(url, { max: 1 });

async function main() {
  const db = drizzle(sql);
  console.log("→ applying table migrations from ./drizzle …");
  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("→ applying PL/pgSQL functions …");
  const functions = readFileSync(join(process.cwd(), "src/db/functions.sql"), "utf8");
  await sql.unsafe(functions);

  console.log("✓ migrations complete");
}

main()
  .catch((err) => {
    console.error("✗ migration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
