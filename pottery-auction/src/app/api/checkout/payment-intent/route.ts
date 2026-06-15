import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { items, orders, order_items } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe/server";
import { computeTotals } from "@/lib/stripe/pricing";

// Buy-now checkout. Migrated from Supabase to Drizzle. RLS is gone, so auth is
// enforced via getCurrentUser(). The atomic reservation still goes through the
// Postgres try_reserve_item() function (called with raw SQL).
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.sku) {
    return NextResponse.json({ error: "Missing required field: sku" }, { status: 400 });
  }
  const { sku } = body as { sku: string };

  const [item] = await db
    .select({
      id: items.id,
      sku: items.sku,
      title: items.title,
      buy_now_price: items.buy_now_price,
      listing_type: items.listing_type,
      sold_at: items.sold_at,
      reserved_until: items.reserved_until,
      reserved_order_id: items.reserved_order_id,
    })
    .from(items)
    .where(eq(items.sku, sku))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  if (item.listing_type !== "buy_now") {
    return NextResponse.json({ error: "Item is not available for buy-now" }, { status: 400 });
  }
  if (item.sold_at) {
    return NextResponse.json(
      { error: "item_sold", message: "This item has already been sold." },
      { status: 409 },
    );
  }

  const amounts = computeTotals(item.buy_now_price ?? 0);
  const reservationLive = !!item.reserved_until && new Date(item.reserved_until) > new Date();

  // Idempotent retry: if THIS item is reserved by a pending order owned by this
  // user, reuse that order's PaymentIntent instead of creating a duplicate.
  if (reservationLive && item.reserved_order_id) {
    const [existingOrder] = await db
      .select({
        id: orders.id,
        stripe_payment_intent_id: orders.stripe_payment_intent_id,
        subtotal_cents: orders.subtotal_cents,
        shipping_cents: orders.shipping_cents,
        tax_cents: orders.tax_cents,
        total_cents: orders.total_cents,
      })
      .from(orders)
      .where(
        and(
          eq(orders.id, item.reserved_order_id),
          eq(orders.user_id, user.id),
          eq(orders.status, "pending"),
        ),
      )
      .limit(1);

    if (existingOrder?.stripe_payment_intent_id) {
      const pi = await stripe.paymentIntents.retrieve(existingOrder.stripe_payment_intent_id);
      if (pi.client_secret) {
        return NextResponse.json({
          clientSecret: pi.client_secret,
          orderId: existingOrder.id,
          amounts: {
            subtotalCents: existingOrder.subtotal_cents,
            shippingCents: existingOrder.shipping_cents,
            taxCents: existingOrder.tax_cents,
            totalCents: existingOrder.total_cents,
          },
        });
      }
    }

    // Reserved by a different user (or a non-pending/foreign order) — unavailable.
    return NextResponse.json(
      {
        error: "item_unavailable",
        message: "This item is currently being purchased by another customer. Please check back shortly.",
      },
      { status: 409 },
    );
  }

  // Create order + order_item rows.
  const [order] = await db
    .insert(orders)
    .values({
      user_id: user.id,
      status: "pending",
      subtotal_cents: amounts.subtotalCents,
      shipping_cents: amounts.shippingCents,
      tax_cents: amounts.taxCents,
      total_cents: amounts.totalCents,
    })
    .returning({ id: orders.id });

  if (!order) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  try {
    await db.insert(order_items).values({
      order_id: order.id,
      item_id: item.id,
      price_cents: amounts.subtotalCents,
      source: "buy_now",
    });
  } catch {
    await db.delete(orders).where(eq(orders.id, order.id));
    return NextResponse.json({ error: "Failed to create order item" }, { status: 500 });
  }

  // Atomically reserve the item (15-min TTL). Returns FALSE if already reserved.
  const reservedRows = await db.execute(
    sql`SELECT try_reserve_item(${item.id}::uuid, ${order.id}::uuid, 15) AS reserved`,
  );
  const reserved = (reservedRows as unknown as Array<{ reserved: boolean }>)[0]?.reserved;

  if (!reserved) {
    await db.delete(order_items).where(eq(order_items.order_id, order.id));
    await db.delete(orders).where(eq(orders.id, order.id));
    return NextResponse.json(
      {
        error: "item_unavailable",
        message: "This item was just claimed by another customer. Please check back shortly.",
      },
      { status: 409 },
    );
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amounts.totalCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      order_id: order.id,
      item_id: item.id,
      user_id: user.id,
      sku: item.sku ?? "",
    },
    description: `Tor's Pottery — ${item.title} (${item.sku ?? "—"})`,
  });

  await db
    .update(orders)
    .set({ stripe_payment_intent_id: paymentIntent.id })
    .where(eq(orders.id, order.id));

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId: order.id, amounts });
}
