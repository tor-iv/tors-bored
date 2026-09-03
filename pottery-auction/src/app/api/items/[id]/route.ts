import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auctions, items, type Item } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

type Params = Promise<{ id: string }>;

/**
 * GET /api/items/[id]
 * Get a single item by ID
 *
 * Migrated from Supabase to Drizzle/Postgres.
 */
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const [row] = await db.select().from(items).where(eq(items.id, id)).limit(1);

    if (!row) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item: row });
  } catch (error) {
    console.error("Unexpected error in GET /api/items/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/items/[id]
 * Update an item (admin only)
 *
 * Body (all fields optional):
 * - title: string
 * - description: string
 * - auction_id: string UUID
 * - images: string[]
 * - starting_bid: number
 * - current_bid: number
 * - highest_bidder: string UUID
 * - dimensions: object
 * - techniques: string[]
 * - weight: number
 * - featured: boolean
 * - listing_type: "auction" | "buy_now"
 * - buy_now_price: number
 * - reserve_price: number
 * - sku: string
 */
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;

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
      current_bid,
      highest_bidder,
      dimensions,
      techniques,
      weight,
      featured,
      listing_type,
      buy_now_price,
      reserve_price,
      sku,
    } = body;

    // Build update object with only provided fields
    const updates: Partial<Item> = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (auction_id !== undefined) {
      // Verify auction exists if not null
      if (auction_id !== null) {
        const [auction] = await db
          .select({ id: auctions.id })
          .from(auctions)
          .where(eq(auctions.id, auction_id))
          .limit(1);

        if (!auction) {
          return NextResponse.json({ error: "Invalid auction_id - auction not found" }, { status: 400 });
        }
      }
      updates.auction_id = auction_id;
    }
    if (images !== undefined) updates.images = images;
    if (starting_bid !== undefined) {
      if (typeof starting_bid !== "number" || starting_bid < 0) {
        return NextResponse.json({ error: "starting_bid must be a positive number" }, { status: 400 });
      }
      updates.starting_bid = starting_bid;
    }
    if (current_bid !== undefined) updates.current_bid = current_bid;
    if (highest_bidder !== undefined) updates.highest_bidder = highest_bidder;
    if (dimensions !== undefined) updates.dimensions = dimensions;
    if (techniques !== undefined) updates.techniques = techniques;
    if (weight !== undefined) updates.weight = weight;
    if (featured !== undefined) updates.featured = featured;
    if (listing_type !== undefined) updates.listing_type = listing_type;
    if (buy_now_price !== undefined) updates.buy_now_price = buy_now_price;
    if (reserve_price !== undefined) updates.reserve_price = reserve_price;
    if (sku !== undefined) updates.sku = sku;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.updated_at = new Date();

    const [row] = await db
      .update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item: row });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/items/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/items/[id]
 * Delete an item (admin only)
 *
 * Note: This will cascade delete all bids for this item due to foreign key constraint
 */
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized - please login" }, { status: 401 });
    }

    if (!user.isAdmin) {
      return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 });
    }

    await db.delete(items).where(eq(items.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/items/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
