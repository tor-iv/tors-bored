import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/server';
import { computeTotals } from '@/lib/stripe/pricing';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.sku) {
    return NextResponse.json({ error: 'Missing required field: sku' }, { status: 400 });
  }

  const { sku } = body;
  const admin = createAdminClient();

  // Load item — must be buy_now and available
  const { data: item } = await admin
    .from('items')
    .select('id, sku, title, buy_now_price, listing_type, sold_at, reserved_until, reserved_order_id')
    .eq('sku', sku)
    .maybeSingle();

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  if (item.listing_type !== 'buy_now') {
    return NextResponse.json({ error: 'Item is not available for buy-now' }, { status: 400 });
  }
  if (item.sold_at) {
    return NextResponse.json({ error: 'item_sold', message: 'This item has already been sold.' }, { status: 409 });
  }

  const amounts = computeTotals(item.buy_now_price ?? 0);

  // Idempotent retry: if this user has a pending order with a live reservation on this item, reuse it
  const now = new Date().toISOString();
  const { data: existingOrder } = await admin
    .from('orders')
    .select('id, stripe_payment_intent_id, subtotal_cents, shipping_cents, tax_cents, total_cents')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .gt('reserved_until', now) // verify reservation is still valid via items table join below
    .maybeSingle();

  if (existingOrder?.stripe_payment_intent_id) {
    // Verify the reservation belongs to this order
    const { data: reservedItem } = await admin
      .from('items')
      .select('reserved_order_id, reserved_until')
      .eq('id', item.id)
      .maybeSingle();

    if (
      reservedItem?.reserved_order_id === existingOrder.id &&
      reservedItem.reserved_until &&
      new Date(reservedItem.reserved_until) > new Date()
    ) {
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
  }

  // Check if item is currently reserved by someone else
  if (
    item.reserved_until &&
    new Date(item.reserved_until) > new Date() &&
    item.reserved_order_id !== existingOrder?.id
  ) {
    return NextResponse.json({ error: 'item_unavailable', message: 'This item is currently being purchased by another customer. Please check back shortly.' }, { status: 409 });
  }

  // Create order + order_item rows
  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      subtotal_cents: amounts.subtotalCents,
      shipping_cents: amounts.shippingCents,
      tax_cents: amounts.taxCents,
      total_cents: amounts.totalCents,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }

  const { error: itemError } = await admin
    .from('order_items')
    .insert({
      order_id: order.id,
      item_id: item.id,
      price_cents: amounts.subtotalCents,
      source: 'buy_now',
    });

  if (itemError) {
    // Roll back the order row
    await admin.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: 'Failed to create order item' }, { status: 500 });
  }

  // Atomically reserve the item
  const { data: reserved } = await admin.rpc('try_reserve_item', {
    p_item_id: item.id,
    p_order_id: order.id,
    p_ttl_minutes: 15,
  });

  if (!reserved) {
    await admin.from('order_items').delete().eq('order_id', order.id);
    await admin.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: 'item_unavailable', message: 'This item was just claimed by another customer. Please check back shortly.' }, { status: 409 });
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amounts.totalCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      order_id: order.id,
      item_id: item.id,
      user_id: user.id,
      sku: item.sku,
    },
    description: `Tor's Pottery — ${item.title} (${item.sku})`,
  });

  // Persist PI id on order
  await admin
    .from('orders')
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq('id', order.id);

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderId: order.id,
    amounts,
  });
}
