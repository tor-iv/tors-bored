// Seed script (run with `bun run db:seed`). Idempotent: skips if a profile
// already exists. Creates a demo admin, one active auction, and a few items so
// a fresh deploy shows content immediately. Imports nothing from the Next bundle.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { scryptSync, randomBytes } from "node:crypto";
import { profiles, auctions, items } from "./schema";

const url = process.env.DATABASE_URL ?? "postgres://tors:tors@localhost:5432/torsbored";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "vcox484@gmail.com").toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "changeme-pottery-2026";

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema: { profiles, auctions, items } });

async function main() {
  const existing = await db.select({ id: profiles.id }).from(profiles).limit(1);
  if (existing.length > 0) {
    console.log("→ profiles already exist; skipping seed");
    return;
  }

  console.log("→ seeding admin + demo auction + items …");

  const [admin] = await db
    .insert(profiles)
    .values({
      email: ADMIN_EMAIL,
      password_hash: hashPassword(ADMIN_PASSWORD),
      display_name: "Tor",
      is_admin: true,
    })
    .returning({ id: profiles.id });

  // One active auction ending in 3 days.
  const now = Date.now();
  const [auction] = await db
    .insert(auctions)
    .values({
      title: "June Drop — Wheel-Thrown Vessels",
      description: "A small-batch release of hand-thrown stoneware, glazed and fired this month.",
      start_date: new Date(now - 24 * 60 * 60 * 1000),
      end_date: new Date(now + 3 * 24 * 60 * 60 * 1000),
      status: "active",
    })
    .returning({ id: auctions.id });

  // SKUs via the Postgres generate_sku() function (proves it works through Drizzle).
  async function sku(code: string): Promise<string> {
    const rows = await db.execute(sql`SELECT generate_sku(${code}) AS sku`);
    return (rows as unknown as Array<{ sku: string }>)[0].sku;
  }

  await db.insert(items).values([
    {
      auction_id: auction.id,
      title: "Speckled Flower Vase",
      description: "Tall speckled stoneware vase with a celadon pour.",
      images: [],
      starting_bid: 45,
      current_bid: null,
      listing_type: "auction",
      sku: await sku("VAS"),
      techniques: ["wheel-thrown", "celadon glaze"],
      featured: true,
    },
    {
      auction_id: auction.id,
      title: "Tomato Cup Set",
      description: "Set of two tomato-red tumblers.",
      images: [],
      starting_bid: 30,
      current_bid: null,
      listing_type: "auction",
      sku: await sku("CUP"),
      techniques: ["wheel-thrown"],
      featured: false,
    },
    {
      title: "Everyday Mug — Oatmeal",
      description: "Buy-now mug, satin oatmeal glaze.",
      images: [],
      listing_type: "buy_now",
      buy_now_price: 38,
      sku: await sku("MUG"),
      techniques: ["wheel-thrown"],
      featured: true,
    },
  ]);

  console.log(`✓ seeded admin ${ADMIN_EMAIL} (id ${admin.id}) + 1 auction + 3 items`);
  console.log(`  admin password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("✗ seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
