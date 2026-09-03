import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { stripe } from "@/lib/stripe/server";
import { db } from "@/db";
import { orders, profiles, stripe_events } from "@/db/schema";

// Node.js runtime required for stripe.webhooks.constructEvent (uses Node crypto).
export const runtime = "nodejs";

// Insert the event id; the unique PK makes a re-delivery a no-op. Returns true
// if this is the first time we've seen the event.
async function dedup(eventId: string, eventType: string): Promise<boolean> {
  const inserted = await db
    .insert(stripe_events)
    .values({ id: eventId, type: eventType })
    .onConflictDoNothing()
    .returning({ id: stripe_events.id });
  return inserted.length > 0;
}

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.order_id;
  if (!orderId) return;

  await db.execute(sql`SELECT mark_order_paid(${orderId}::uuid)`);

  const shipping = pi.shipping;
  if (shipping) {
    await db
      .update(orders)
      .set({
        shipping_name: shipping.name ?? null,
        shipping_line1: shipping.address?.line1 ?? null,
        shipping_line2: shipping.address?.line2 ?? null,
        shipping_city: shipping.address?.city ?? null,
        shipping_state: shipping.address?.state ?? null,
        shipping_postal_code: shipping.address?.postal_code ?? null,
        shipping_country: shipping.address?.country ?? "US",
      })
      .where(eq(orders.id, orderId));
  }
}

async function handlePaymentIntentFailed(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.order_id;
  if (!orderId) return;
  await db.execute(sql`SELECT mark_order_cancelled(${orderId}::uuid)`);
}

// Save-card flow: persist the saved payment method + customer on the profile so
// the user can bid and be charged off-session when they win.
async function handleSetupIntentSucceeded(si: Stripe.SetupIntent) {
  const userId = si.metadata?.user_id;
  const paymentMethod = typeof si.payment_method === "string" ? si.payment_method : si.payment_method?.id;
  const customerId = typeof si.customer === "string" ? si.customer : si.customer?.id;
  if (!userId || !paymentMethod) return;

  await db
    .update(profiles)
    .set({
      default_payment_method: paymentMethod,
      ...(customerId ? { stripe_customer_id: customerId } : {}),
      updated_at: new Date(),
    })
    .where(eq(profiles.id, userId));
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;
  const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent.id;

  const [order] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripe_payment_intent_id, piId))
    .limit(1);

  if (order) {
    await db.execute(sql`SELECT mark_order_cancelled(${order.id}::uuid)`);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const isNew = await dedup(event.id, event.type);
  if (!isNew) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "setup_intent.succeeded":
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}
