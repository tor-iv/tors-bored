import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "@/db";
import { bids, items, orders, order_items, profiles } from "@/db/schema";
import { stripe } from "@/lib/stripe/server";
import { computeTotals } from "@/lib/stripe/pricing";

export const runtime = "nodejs";

// POST /api/cron/close-check — driven by the Hetzner host crontab every minute
// (Authorization: Bearer $CRON_SECRET). Closes ended auctions and charges
// winners off-session against their saved card. Replaces the disabled pg_cron.
//
// Idempotency: charging a winner is claimed atomically by flipping the won bid's
// stripe_payment_intent_id from NULL → 'charging' in a single UPDATE; overlapping
// cron ticks can't both pick up the same bid. On charge failure (decline/SCA) the
// bid is marked 'failed' and the next-highest bidder is promoted to 'won' for the
// next tick to charge.
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Transition ended auctions; mark won/outbid per item (atomic in PL/pgSQL).
  await db.execute(sql`SELECT close_ended_auctions()`);

  // 2. Atomically claim all unbilled won bids (NULL PI → 'charging' sentinel).
  const claimed = await db
    .update(bids)
    .set({ stripe_payment_intent_id: "charging" })
    .where(and(eq(bids.status, "won"), isNull(bids.stripe_payment_intent_id)))
    .returning({ id: bids.id, item_id: bids.item_id, user_id: bids.user_id, amount: bids.amount });

  const results: Array<{ bid: string; outcome: string }> = [];

  for (const bid of claimed) {
    const outcome = await chargeWinner(bid);
    results.push({ bid: bid.id, outcome });
  }

  return NextResponse.json({ closed: true, charged: claimed.length, results });
}

type ClaimedBid = { id: string; item_id: string; user_id: string; amount: number };

async function chargeWinner(bid: ClaimedBid): Promise<string> {
  const [winner] = await db
    .select({
      email: profiles.email,
      stripe_customer_id: profiles.stripe_customer_id,
      default_payment_method: profiles.default_payment_method,
    })
    .from(profiles)
    .where(eq(profiles.id, bid.user_id))
    .limit(1);

  // No usable card (removed since bidding) → fail and roll to next bidder.
  if (!winner?.stripe_customer_id || !winner.default_payment_method) {
    await failAndPromote(bid, "no_payment_method");
    return "no_payment_method";
  }

  const amounts = computeTotals(bid.amount);

  // Create the pending order + line item first so the webhook can mark it paid.
  const [order] = await db
    .insert(orders)
    .values({
      user_id: bid.user_id,
      status: "pending",
      subtotal_cents: amounts.subtotalCents,
      shipping_cents: amounts.shippingCents,
      tax_cents: amounts.taxCents,
      total_cents: amounts.totalCents,
    })
    .returning({ id: orders.id });

  await db.insert(order_items).values({
    order_id: order.id,
    item_id: bid.item_id,
    price_cents: amounts.subtotalCents,
    source: "auction_win",
  });

  try {
    const pi = await stripe.paymentIntents.create(
      {
        amount: amounts.totalCents,
        currency: "usd",
        customer: winner.stripe_customer_id,
        payment_method: winner.default_payment_method,
        off_session: true,
        confirm: true,
        metadata: { order_id: order.id, item_id: bid.item_id, user_id: bid.user_id, bid_id: bid.id },
        description: `Tor's Pottery — auction win (bid ${bid.id})`,
      },
      { idempotencyKey: `auction-charge-${bid.id}` },
    );

    // Persist the real PI id on the bid (replaces the 'charging' sentinel).
    await db.update(bids).set({ stripe_payment_intent_id: pi.id }).where(eq(bids.id, bid.id));
    await db.update(orders).set({ stripe_payment_intent_id: pi.id }).where(eq(orders.id, order.id));
    // payment_intent.succeeded webhook marks the order paid + item sold.
    return pi.status === "succeeded" ? "charged" : `pi_${pi.status}`;
  } catch (err) {
    // Off-session charges most often fail on decline or SCA (authentication_required).
    // TODO: email the winner a hosted payment link before forfeiting (no mailer wired yet).
    const code = err instanceof Stripe.errors.StripeError ? err.code ?? err.type : "charge_error";
    await db.update(orders).set({ status: "cancelled", updated_at: new Date() }).where(eq(orders.id, order.id));
    await failAndPromote(bid, String(code));
    return `failed:${code}`;
  }
}

// Mark the winning bid 'failed' and promote the next-highest bidder on the item
// to 'won' (with a NULL PI) so the next cron tick attempts to charge them.
async function failAndPromote(bid: ClaimedBid, _reason: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(bids).set({ status: "failed" }).where(eq(bids.id, bid.id));

    const [next] = await tx
      .select({ id: bids.id })
      .from(bids)
      .where(and(eq(bids.item_id, bid.item_id), eq(bids.status, "outbid")))
      .orderBy(desc(bids.amount))
      .limit(1);

    if (next) {
      await tx
        .update(bids)
        .set({ status: "won", stripe_payment_intent_id: null })
        .where(eq(bids.id, next.id));
      // Reflect the new leader on the item.
      const [nb] = await tx.select({ amount: bids.amount, user_id: bids.user_id }).from(bids).where(eq(bids.id, next.id)).limit(1);
      if (nb) {
        await tx.update(items).set({ current_bid: nb.amount, highest_bidder: nb.user_id }).where(eq(items.id, bid.item_id));
      }
    }
  });
}
