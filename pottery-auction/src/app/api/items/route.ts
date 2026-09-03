import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auctions, items } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/items
 * List all items with optional filtering
 *
 * Query params:
 * - auction_id: Filter by auction ID
 * - featured: Filter by featured status (true/false)
 *
 * Migrated from Supabase to Drizzle/Postgres.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const auctionId = searchParams.get("auction_id");
    const featured = searchParams.get("featured");

    const conditions = [];
    if (auctionId) {
      conditions.push(eq(items.auction_id, auctionId));
    }
    if (featured === "true") {
      conditions.push(eq(items.featured, true));
    } else if (featured === "false") {
      conditions.push(eq(items.featured, false));
    }

    const rows =
      conditions.length > 0
        ? await db
            .select()
            .from(items)
            .where(and(...conditions))
            .orderBy(desc(items.created_at))
        : await db.select().from(items).orderBy(desc(items.created_at));

    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error("Unexpected error in GET /api/items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/items
 * Create a new item (admin only)
 *
 * Body:
 * - title: string (required)
 * - description: string (optional)
 * - auction_id: string UUID (optional)
 * - images: string[] (optional, defaults to [])
 * - starting_bid: number (required)
 * - dimensions: { height?: number, width?: number, depth?: number } (optional)
 * - techniques: string[] (optional, defaults to [])
 * - weight: number (optional)
 * - featured: boolean (optional, defaults to false)
 * - listing_type: "auction" | "buy_now" (optional, defaults to "auction")
 * - buy_now_price: number (optional)
 * - reserve_price: number (optional)
 * - sku: string (optional — if omitted and type_code provided, generate_sku() is called)
 * - type_code: string (optional — passed to generate_sku() when sku is not supplied)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized - please login" }, { status: 401 });
    }

    if (!user.isAdmin) {
      return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      auction_id,
      images,
      starting_bid,
      dimensions,
      techniques,
      weight,
      featured,
      listing_type,
      buy_now_price,
      reserve_price,
      sku,
      type_code,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Missing required field: title" }, { status: 400 });
    }

    if (starting_bid === undefined || starting_bid === null) {
      return NextResponse.json({ error: "Missing required field: starting_bid" }, { status: 400 });
    }

    if (typeof starting_bid !== "number" || starting_bid < 0) {
      return NextResponse.json({ error: "starting_bid must be a positive number" }, { status: 400 });
    }

    // If auction_id provided, verify it exists
    if (auction_id) {
      const [auction] = await db
        .select({ id: auctions.id })
        .from(auctions)
        .where(eq(auctions.id, auction_id))
        .limit(1);

      if (!auction) {
        return NextResponse.json({ error: "Invalid auction_id - auction not found" }, { status: 400 });
      }
    }

    // Resolve SKU: use provided value, or call generate_sku() if type_code given
    let resolvedSku: string | null = sku ?? null;
    if (!resolvedSku && type_code) {
      const rows = await db.execute(sql`SELECT generate_sku(${type_code}) AS generate_sku`);
      const first = rows[0] as Record<string, unknown> | undefined;
      resolvedSku = (first?.generate_sku as string) ?? null;
    }

    const [row] = await db
      .insert(items)
      .values({
        title,
        description: description ?? null,
        auction_id: auction_id ?? null,
        images: images ?? [],
        starting_bid,
        current_bid: starting_bid,
        dimensions: dimensions ?? null,
        techniques: techniques ?? [],
        weight: weight ?? null,
        featured: featured ?? false,
        listing_type: listing_type ?? "auction",
        buy_now_price: buy_now_price ?? null,
        reserve_price: reserve_price ?? null,
        sku: resolvedSku,
      })
      .returning();

    return NextResponse.json({ item: row }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
