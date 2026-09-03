import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { bids, items, auctions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/bids — place a bid (authenticated users only).
 * Body: { item_id: string, amount: number }
 *
 * Migrated from Supabase to Drizzle/Postgres. RLS is gone, so auth is enforced
 * here via getCurrentUser(). The write (outbid previous → insert → update item)
 * runs in a single transaction for atomicity (replaces the old manual rollback).
 *
 * WS-D will add the saved-card requirement (a bidder must have a Stripe payment
 * method on file before a bid is accepted). Marked below.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - please login to place a bid" }, { status: 401 });
    }

    const body = await request.json();
    const { item_id, amount } = body as { item_id?: string; amount?: number };

    if (!item_id) {
      return NextResponse.json({ error: "Missing required field: item_id" }, { status: 400 });
    }
    if (amount === undefined || amount === null) {
      return NextResponse.json({ error: "Missing required field: amount" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const [item] = await db
      .select({
        id: items.id,
        title: items.title,
        starting_bid: items.starting_bid,
        current_bid: items.current_bid,
        auction_id: items.auction_id,
      })
      .from(items)
      .where(eq(items.id, item_id))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.starting_bid != null && amount < item.starting_bid) {
      return NextResponse.json(
        { error: `Bid must be at least the starting bid of $${item.starting_bid}`, minimum_bid: item.starting_bid },
        { status: 400 },
      );
    }
    if (item.current_bid != null && amount <= item.current_bid) {
      return NextResponse.json(
        { error: `Bid must be higher than current bid of $${item.current_bid}`, minimum_bid: item.current_bid + 1 },
        { status: 400 },
      );
    }

    if (item.auction_id) {
      const [auction] = await db
        .select({
          id: auctions.id,
          status: auctions.status,
          end_date: auctions.end_date,
          extended_end_date: auctions.extended_end_date,
        })
        .from(auctions)
        .where(eq(auctions.id, item.auction_id))
        .limit(1);

      if (!auction) {
        return NextResponse.json({ error: "Auction not found" }, { status: 404 });
      }
      if (auction.status !== "active") {
        return NextResponse.json({ error: `Cannot bid on ${auction.status} auction` }, { status: 400 });
      }
      const endsAt = auction.extended_end_date ?? auction.end_date;
      if (new Date() > new Date(endsAt)) {
        return NextResponse.json({ error: "Auction has ended" }, { status: 400 });
      }
    }

    // A bid is a binding commitment to pay if you win, so a saved card is
    // required up front (collected via the SetupIntent flow). 402 → the client
    // opens the add-card modal, then retries the bid.
    if (!user.defaultPaymentMethod) {
      return NextResponse.json(
        { error: "payment_method_required", message: "Add a card before bidding." },
        { status: 402 },
      );
    }

    const newBid = await db.transaction(async (tx) => {
      // Demote the current highest confirmed bid(s) on this item.
      await tx
        .update(bids)
        .set({ status: "outbid" })
        .where(and(eq(bids.item_id, item_id), inArray(bids.status, ["pending", "confirmed"])));

      const [created] = await tx
        .insert(bids)
        .values({
          item_id,
          auction_id: item.auction_id ?? null,
          user_id: user.id,
          amount,
          status: "confirmed",
        })
        .returning();

      await tx.update(items).set({ current_bid: amount, highest_bidder: user.id }).where(eq(items.id, item_id));

      return created;
    });

    return NextResponse.json({ bid: newBid, message: "Bid placed successfully" }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/bids:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/bids — the caller's own bids; admins see all.
 * RLS-backstop: non-admins are explicitly filtered to their own user id.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - please login" }, { status: 401 });
    }

    const rows = user.isAdmin
      ? await db.select().from(bids).orderBy(desc(bids.created_at))
      : await db.select().from(bids).where(eq(bids.user_id, user.id)).orderBy(desc(bids.created_at));

    return NextResponse.json({ bids: rows });
  } catch (error) {
    console.error("Unexpected error in GET /api/bids:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
