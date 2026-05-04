import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Node.js runtime required for stripe.webhooks.constructEvent (uses Node crypto)
export const runtime = 'nodejs';

async function dedup(admin: ReturnType<typeof createAdminClient>, eventId: string, eventType: string): Promise<boolean> {
  const { error } = await admin
    .from('stripe_events')
    .insert({ id: eventId, type: eventType })
    .select();

  // Unique constraint violation means we've seen this event before
  return !error;
}

async function handlePaymentIntentSucceeded(admin: ReturnType<typeof createAdminClient>, pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.order_id;
  if (!orderId) return;

  // Update order status and mark item sold
  await admin.rpc('mark_order_paid', { p_order_id: orderId });

  // Persist shipping address from PaymentIntent if available
  const shipping = pi.shipping;
  if (shipping) {
    await admin
      .from('orders')
      .update({
        shipping_name: shipping.name,
        shipping_line1: shipping.address?.line1,
        shipping_line2: shipping.address?.line2,
        shipping_city: shipping.address?.city,
        shipping_state: shipping.address?.state,
        shipping_postal_code: shipping.address?.postal_code,
        shipping_country: shipping.address?.country ?? 'US',
      })
      .eq('id', orderId);
  }
}

async function handlePaymentIntentFailed(admin: ReturnType<typeof createAdminClient>, pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.order_id;
  if (!orderId) return;
  await admin.rpc('mark_order_cancelled', { p_order_id: orderId });
}

async function handleChargeRefunded(admin: ReturnType<typeof createAdminClient>, charge: Stripe.Charge) {
  if (!charge.payment_intent) return;
  const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent.id;

  const { data: order } = await admin
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', piId)
    .maybeSingle();

  if (order) {
    await admin.rpc('mark_order_cancelled', { p_order_id: order.id });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const admin = createAdminClient();
  const isNew = await dedup(admin, event.id, event.type);
  if (!isNew) {
    // Already processed — ack silently
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(admin, event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
        await handlePaymentIntentFailed(admin, event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(admin, event.data.object as Stripe.Charge);
        break;
    }
  } catch (err) {
    // Log but still return 200 — Stripe will retry if we 5xx, creating duplicate-processing risk
    console.error(`Webhook handler error for ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}
