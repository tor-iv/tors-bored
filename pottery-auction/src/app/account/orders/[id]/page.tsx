import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { formatReceiptTimestamp, formatReceiptDate } from '@/lib/format/receipt-timestamp';
import HanddrawnOrderDetail from '@/components/theme/handdrawn/HanddrawnOrderDetail';
import Y2KOrderDetail from '@/components/theme/y2k/Y2KOrderDetail';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import PolaroidPhoto from '@/components/theme/receipt/PolaroidPhoto';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface Props {
  params: Promise<{ id: string }>;
}

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

function getStatusBadgeIntent(status: string): 'current' | 'outbid' | 'error' | 'won' {
  switch (status) {
    case 'paid': return 'current';
    case 'shipped': return 'won';
    case 'delivered': return 'won';
    case 'cancelled': return 'error';
    default: return 'outbid';
  }
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, status, subtotal_cents, shipping_cents, tax_cents, total_cents,
      created_at, updated_at, user_id,
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

  if (!order) notFound();

  const now = new Date();
  const orderItems = order.order_items ?? [];
  const firstItem = orderItems[0]?.item as any;

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme === 'handdrawn') {
    return <HanddrawnOrderDetail order={order} />;
  }

  if (theme === 'y2k') {
    return <Y2KOrderDetail order={order} />;
  }

  return (
    <ReceiptPage>
      <ReceiptHeader
        ticket={`ORDER-${id.slice(0, 8).toUpperCase()}`}
        date={now}
      />

      {/* Item photo */}
      {firstItem?.images?.[0] && (
        <div className="py-4">
          <PolaroidPhoto
            src={firstItem.images[0]}
            alt={firstItem.title}
            sku={firstItem.sku ?? undefined}
            caption={firstItem.title}
          />
        </div>
      )}

      {/* Order summary */}
      <ReceiptDivider variant="major" />
      <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
        ORDER SUMMARY
      </div>
      <ReceiptDivider variant="major" />
      <div className="py-2 space-y-0.5 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>ORDER ID</span>
          <span className="font-semibold">{id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>DATE</span>
          <span>{formatReceiptTimestamp(order.created_at)}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>STATUS</span>
          <Badge intent={getStatusBadgeIntent(order.status)}>{order.status.toUpperCase()}</Badge>
        </div>
      </div>

      {/* Items */}
      <ReceiptDivider variant="major" />
      <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
        ITEMS
      </div>
      <ReceiptDivider variant="major" />
      <div className="py-2 space-y-2 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)' }}>
        {orderItems.map((oi: any) => {
          const item = oi.item;
          return (
            <div key={oi.id}>
              <div className="flex justify-between items-baseline">
                <Link href={`/piece/${item?.sku}`} className="font-semibold hover:underline" style={{ color: 'var(--ink)' }}>
                  {item?.title ?? 'ITEM'}
                </Link>
                <span className="receipt-price font-bold" style={{ color: 'var(--ink)' }}>{formatCents(oi.price_cents)}</span>
              </div>
              <div className="text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
                {item?.sku} · {oi.source === 'auction_win' ? 'AUCTION WIN' : 'BUY NOW'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing breakdown */}
      <ReceiptDivider variant="major" />
      <div className="py-2 space-y-1 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)' }}>
        <div className="flex justify-between">
          <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>SUBTOTAL</span>
          <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(order.subtotal_cents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>SHIPPING</span>
          <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(order.shipping_cents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>TAX (NY 8.875%)</span>
          <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(order.tax_cents)}</span>
        </div>
        <ReceiptDivider variant="minor" />
        <div className="flex justify-between text-[1.125rem] font-bold">
          <span className="uppercase" style={{ color: 'var(--ink)' }}>TOTAL</span>
          <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(order.total_cents)}</span>
        </div>
      </div>

      {/* Shipping address */}
      {order.shipping_name && (
        <>
          <ReceiptDivider variant="major" />
          <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
            SHIP TO
          </div>
          <ReceiptDivider variant="major" />
          <div className="py-2 space-y-0.5 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            <div>{order.shipping_name}</div>
            <div>{order.shipping_line1}</div>
            {order.shipping_line2 && <div>{order.shipping_line2}</div>}
            <div>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</div>
            <div className="uppercase">{order.shipping_country}</div>
          </div>
        </>
      )}

      {/* Shipping status */}
      <ReceiptDivider variant="major" />
      <div className="py-2 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}>
        {order.status === 'paid' && (
          <div>
            <div className="font-bold uppercase" style={{ color: 'var(--ink)' }}>PROCESSING YOUR ORDER</div>
            <div className="mt-0.5">We&apos;ll email you when your piece ships.</div>
          </div>
        )}
        {order.status === 'shipped' && (
          <div>
            <div className="font-bold uppercase" style={{ color: 'var(--ink)' }}>YOUR PIECE IS ON ITS WAY</div>
            <div className="mt-0.5">Tracking information will be sent to your email.</div>
          </div>
        )}
        {order.status === 'delivered' && (
          <div>
            <div className="font-bold uppercase" style={{ color: 'var(--ink)' }}>DELIVERED</div>
            <div className="mt-0.5">Enjoy your handmade piece!</div>
          </div>
        )}
        {order.status === 'cancelled' && (
          <div>
            <div className="font-bold uppercase" style={{ color: 'var(--error)' }}>ORDER CANCELLED</div>
            <div className="mt-0.5">If you have questions, please reach out.</div>
          </div>
        )}
        {order.status === 'pending' && (
          <div>
            <div className="font-bold uppercase">PAYMENT PENDING</div>
            <div className="mt-0.5">Your payment is being processed.</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <ReceiptDivider variant="major" />
      <div className="py-3 flex gap-4 flex-wrap items-center">
        <Link href="/account">
          <Button intent="secondary">{'< MY ACCOUNT >'}</Button>
        </Link>
        <Link href="/browse">
          <Button intent="secondary">{'[ BROWSE MORE ]'}</Button>
        </Link>
      </div>
      <ReceiptDivider variant="major" />

      <div className="py-2 text-[0.6875rem] text-center uppercase" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}>
        KEEP YOUR RECEIPT
      </div>

      <ReceiptFooter />
    </ReceiptPage>
  );
}
