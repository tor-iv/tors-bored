import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { orders, order_items, items } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { formatReceiptTimestamp, formatReceiptDate } from '@/lib/format/receipt-timestamp';
import Y2KOrderDetail from '@/components/theme/y2k/Y2KOrderDetail';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptChrome from '@/components/theme/receipt/ReceiptChrome';
import ReceiptFooterChrome from '@/components/theme/receipt/ReceiptFooterChrome';
import ReceiptPhotoFrame from '@/components/theme/receipt/ReceiptPhotoFrame';
import Barcode from '@/components/theme/receipt/Barcode';
import Button from '@/components/ui/Button';

interface Props {
  params: Promise<{ id: string }>;
}

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'paid':      return '#335a7a';
    case 'shipped':   return '#2e7d32';
    case 'delivered': return '#2e7d32';
    case 'cancelled': return 'var(--error)';
    default:          return 'var(--ink-muted)';
  }
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect('/');

  // Ownership gate: admin can view any order, regular user only their own
  const orderWhere = user.isAdmin
    ? eq(orders.id, id)
    : and(eq(orders.id, id), eq(orders.user_id, user.id));

  const [orderRow] = await db
    .select()
    .from(orders)
    .where(orderWhere)
    .limit(1);

  if (!orderRow) notFound();

  // Fetch order_items with item join
  const oiRows = await db
    .select({ oi: order_items, i: items })
    .from(order_items)
    .leftJoin(items, eq(order_items.item_id, items.id))
    .where(eq(order_items.order_id, id));

  const orderItemsMapped = oiRows.map((r) => ({
    id: r.oi.id,
    price_cents: r.oi.price_cents,
    source: r.oi.source,
    item: r.i
      ? {
          id: r.i.id,
          sku: r.i.sku,
          title: r.i.title,
          images: r.i.images,
          techniques: r.i.techniques,
          dimensions: r.i.dimensions,
          weight: r.i.weight,
        }
      : null,
  }));

  // Reconstruct nested order shape
  const order = { ...orderRow, order_items: orderItemsMapped };

  const now = new Date();
  const firstItem = orderItemsMapped[0]?.item ?? null;

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme === 'y2k') {
    return <Y2KOrderDetail order={order} />;
  }

  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const statusColor = getStatusColor(order.status);
  const statusLabel = order.status.toUpperCase();

  return (
    <ReceiptPage>
      <ReceiptChrome />
      <div className="receipt-section-bar" style={{ margin: '18px 0 4px' }}>
        <span>ORDER RECORD</span>
        <span className="receipt-section-bar-count">{id.slice(0, 8).toUpperCase()}</span>
      </div>
      <div
        className="flex flex-wrap justify-between"
        style={{ gap: '2px 12px', fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)', padding: '6px 0 10px' }}
      >
        <span>DATE: {formatReceiptDate(order.created_at)}</span>
        <span style={{ color: statusColor }}>STATUS: {statusLabel}</span>
      </div>

          {/* Item photo */}
          {firstItem && (
            <div className="py-4">
              <ReceiptPhotoFrame
                src={firstItem.images?.[0]}
                alt={firstItem.title}
                title={firstItem.title}
                size="lg"
              />
            </div>
          )}

          {/* Order summary — leader-dot rows */}
          <div className="receipt-section-bar" style={{ margin: '4px 0 8px' }}>
            <span>ORDER SUMMARY</span>
          </div>
          <div className="py-2 space-y-1">
            <div
              className="receipt-line-item"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">ORDER ID</span>
              <span className="leader" aria-hidden="true" />
              <span style={{ color: 'var(--ink)' }}>{id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div
              className="receipt-line-item"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">DATE</span>
              <span className="leader" aria-hidden="true" />
              <span style={{ color: 'var(--ink)' }}>{formatReceiptTimestamp(order.created_at)}</span>
            </div>
            <div
              className="receipt-line-item"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">STATUS</span>
              <span className="leader" aria-hidden="true" />
              <span
                style={{
                  fontFamily: 'var(--font-stamp)',
                  color: statusColor,
                  border: `1.5px solid ${statusColor}`,
                  borderRadius: 2,
                  padding: '0px 6px',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  mixBlendMode: 'multiply',
                  opacity: 0.85,
                }}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Items */}
          <ReceiptDivider variant="major" />
          <div
            className="text-[0.625rem] uppercase tracking-widest pb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            ITEMS
          </div>
          <ReceiptDivider variant="minor" />
          <div className="py-2 space-y-2" style={{ fontFamily: 'var(--font-display)' }}>
            {orderItemsMapped.map((oi) => {
              const item = oi.item;
              return (
                <div key={oi.id}>
                  <div
                    className="receipt-line-item"
                    style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}
                  >
                    <Link href={`/piece/${item?.sku}`} className="font-semibold hover:underline" style={{ color: 'var(--ink)' }}>
                      {item?.title ?? 'ITEM'}
                    </Link>
                    <span className="leader" aria-hidden="true" />
                    <span
                      className="receipt-price"
                      style={{ color: 'var(--ink)', whiteSpace: 'nowrap', fontFamily: 'var(--font-thermal)', fontSize: '1rem' }}
                    >
                      {formatCents(oi.price_cents)}
                    </span>
                  </div>
                  <div className="text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
                    {item?.sku} · {oi.source === 'auction_win' ? 'AUCTION WIN' : 'BUY NOW'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing breakdown — leader-dot rows */}
          <ReceiptDivider variant="major" />
          <div className="py-2 space-y-1" style={{ fontFamily: 'var(--font-display)' }}>
            <div
              className="receipt-line-item"
              style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase">SUBTOTAL</span>
              <span className="leader" aria-hidden="true" />
              <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(order.subtotal_cents)}</span>
            </div>
            <div
              className="receipt-line-item"
              style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase">SHIPPING</span>
              <span className="leader" aria-hidden="true" />
              <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(order.shipping_cents)}</span>
            </div>
            <div
              className="receipt-line-item"
              style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase">TAX (NY 8.875%)</span>
              <span className="leader" aria-hidden="true" />
              <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(order.tax_cents)}</span>
            </div>
            <ReceiptDivider variant="minor" />
            {/* Big VT323 TOTAL */}
            <div
              className="receipt-line-item"
              style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
            >
              <span className="uppercase font-bold" style={{ color: 'var(--ink)' }}>TOTAL</span>
              <span className="leader" aria-hidden="true" />
              <span
                className="receipt-price"
                style={{
                  fontFamily: 'var(--font-thermal)',
                  fontSize: '2rem',
                  lineHeight: 1,
                  color: 'var(--ink)',
                  letterSpacing: '0.05em',
                }}
              >
                {formatCents(order.total_cents)}
              </span>
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_name && (
            <>
              <ReceiptDivider variant="major" />
              <div
                className="text-[0.625rem] uppercase tracking-widest pb-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                SHIP TO
              </div>
              <ReceiptDivider variant="minor" />
              <div
                className="py-2 space-y-0.5 text-[0.875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
              >
                <div>{order.shipping_name}</div>
                <div>{order.shipping_line1}</div>
                {order.shipping_line2 && <div>{order.shipping_line2}</div>}
                <div>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</div>
                <div className="uppercase">{order.shipping_country}</div>
              </div>
            </>
          )}

          {/* Shipping status message */}
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

          <div className="py-3 flex gap-4 flex-wrap items-center justify-center">
            <Link href="/account" className="receipt-action-btn">
              MY ACCOUNT
            </Link>
            <Link href="/browse" className="receipt-view-item-link">
              BROWSE MORE →
            </Link>
          </div>

      <ReceiptFooterChrome barcodeSeed={order.id} />
    </ReceiptPage>
  );
}
