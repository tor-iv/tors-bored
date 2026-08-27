// Seed script (run with `bun run db:seed`). Two independently-gated steps:
// ensureAdmin() runs unless the admin email already has a profile;
// seedCatalog() runs only while the items table is empty, and inserts inside a
// transaction so a partial failure can't leave the empty-table gate wedged.
// Imports nothing from the Next bundle.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";
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

async function ensureAdmin() {
  const existing = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, ADMIN_EMAIL))
    .limit(1);
  if (existing.length > 0) {
    console.log(`→ admin ${ADMIN_EMAIL} exists; skipping`);
    return;
  }
  const [admin] = await db
    .insert(profiles)
    .values({
      email: ADMIN_EMAIL,
      password_hash: hashPassword(ADMIN_PASSWORD),
      display_name: "Tor",
      is_admin: true,
    })
    .returning({ id: profiles.id });
  console.log(`✓ seeded admin ${ADMIN_EMAIL} (id ${admin.id})`);
  console.log(`  admin password: ${ADMIN_PASSWORD}`);
}

async function seedCatalog() {
  const existing = await db.select({ id: items.id }).from(items).limit(1);
  if (existing.length > 0) {
    console.log("→ items exist; skipping catalog seed");
    return;
  }

  await db.transaction(async (tx) => {
    const now = Date.now();
    const [auction] = await tx
      .insert(auctions)
      .values({
        title: "Late Summer Drop — Wheel-Thrown & Sculptural",
        description:
          "Three one-of-a-kind vessels, thrown and finished in the Brooklyn studio this summer.",
        start_date: new Date(now - 24 * 60 * 60 * 1000),
        end_date: new Date(now + 4 * 24 * 60 * 60 * 1000),
        status: "active",
      })
      .returning({ id: auctions.id });

    // SKUs via the Postgres generate_sku() function.
    async function skuFor(code: string): Promise<string> {
      const rows = await tx.execute(sql`SELECT generate_sku(${code}) AS sku`);
      return (rows as unknown as Array<{ sku: string }>)[0].sku;
    }

    await tx.insert(items).values([
      // Featured buy-now piece — exactly one item carries featured: true.
      {
        title: "Tomato-Shaped Lidded Jar",
        description:
          "Hand-built lidded jar in the shape of a ripe tomato, with a green stem-knob lid. Food-safe glaze inside and out.",
        images: ["/pieces/tomato.webp"],
        listing_type: "buy_now" as const,
        buy_now_price: 68,
        sku: await skuFor("POT"),
        techniques: ["hand-built", "underglaze", "food-safe glaze"],
        featured: true,
      },
      {
        auction_id: auction.id,
        title: "Carved Bottle Vase — Forest Green",
        description:
          "Tall bottle-neck vase with hand-carved flowing relief under a mossy green matte glaze.",
        images: ["/pieces/green-vase.webp"],
        starting_bid: 65,
        current_bid: null,
        listing_type: "auction" as const,
        sku: await skuFor("VAS"),
        techniques: ["wheel-thrown", "carved relief", "matte glaze"],
        featured: false,
      },
      {
        auction_id: auction.id,
        title: "Mondrian Block Vase",
        description:
          "Cream stoneware vase hand-painted with primary color blocks and charcoal grid lines.",
        images: ["/pieces/multicolor-vase.webp"],
        starting_bid: 85,
        current_bid: null,
        listing_type: "auction" as const,
        sku: await skuFor("VAS"),
        techniques: ["wheel-thrown", "underglaze color-block", "hand-painted"],
        featured: false,
      },
      {
        auction_id: auction.id,
        title: "Painted Flower Vase — Yellow & Pink",
        description:
          "Soft yellow vase with loose hand-painted pink blossoms. Holds a full bouquet.",
        images: ["/pieces/white-flower.webp"],
        starting_bid: 50,
        current_bid: null,
        listing_type: "auction" as const,
        sku: await skuFor("VAS"),
        techniques: ["wheel-thrown", "hand-painted florals"],
        featured: false,
      },
      {
        title: "Ribbed Vase — Oatmeal Speckle",
        description:
          "Bulbous ribbed vase in a speckled oatmeal clay body, finished with a clear satin glaze.",
        images: ["/pieces/white-rib-vase.webp"],
        listing_type: "buy_now" as const,
        buy_now_price: 42,
        sku: await skuFor("VAS"),
        techniques: ["wheel-thrown", "ribbed texture", "speckle glaze"],
        featured: false,
      },
    ]);
  });

  console.log("✓ seeded catalog: 1 auction + 5 items (3 auction lots, 2 buy-now)");
}

async function main() {
  await ensureAdmin();
  await seedCatalog();
}

main()
  .catch((err) => {
    console.error("✗ seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
