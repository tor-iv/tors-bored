import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { auctions, items } from "@/db/schema";

type Params = Promise<{ id: string }>;

/**
 * GET /api/auctions/[id]/items
 * Get all items in a specific auction.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params;

    // First verify the auction exists
    const [auction] = await db
      .select({ id: auctions.id, title: auctions.title, status: auctions.status })
      .from(auctions)
      .where(eq(auctions.id, id))
      .limit(1);

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Fetch all items in this auction
    const rows = await db
      .select()
      .from(items)
      .where(eq(items.auction_id, id))
      .orderBy(desc(items.created_at));

    return NextResponse.json({
      auction: {
        id: auction.id,
        title: auction.title,
        status: auction.status,
      },
      items: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/auctions/[id]/items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
