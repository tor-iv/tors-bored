import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, status, subtotal_cents, shipping_cents, tax_cents, total_cents,
      created_at, updated_at,
      shipping_name, shipping_line1, shipping_line2, shipping_city,
      shipping_state, shipping_postal_code, shipping_country,
      stripe_payment_intent_id,
      order_items(
        id, price_cents, source,
        item:items(id, sku, title, images, techniques, dimensions, weight)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}
