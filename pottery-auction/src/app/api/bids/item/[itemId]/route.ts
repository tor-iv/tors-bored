import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bids, items } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

type Params = Promise<{ itemId: string }>;

/**
 * GET /api/bids/item/[itemId]
 * Get all bids for a specific item.
 * - Admins: see all bids for the item.
 * - Regular users: see only their own bids for the item.
 *
 * Migrated from Supabase to Drizzle/Postgres. RLS is gone — the per-user filter
 * that RLS enforced for non-admins is now applied explicitly here.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { itemId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please login" },
        { status: 401 },
      );
    }

    const [item] = await db
      .select({
        id: items.id,
        title: items.title,
        current_bid: items.current_bid,
      })
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // RLS-backstop: admins see all bids; regular users see only their own.
    const rows = user.isAdmin
      ? await db
          .select()
          .from(bids)
          .where(eq(bids.item_id, itemId))
          .orderBy(desc(bids.amount))
      : await db
          .select()
          .from(bids)
          .where(and(eq(bids.item_id, itemId), eq(bids.user_id, user.id)))
          .orderBy(desc(bids.amount));

    return NextResponse.json({
      item: {
        id: item.id,
        title: item.title,
        current_bid: item.current_bid,
      },
      bids: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/bids/item/[itemId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
