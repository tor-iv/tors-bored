import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { orders, order_items, items } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { formatReceiptTimestamp } from '@/lib/format/receipt-timestamp';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptChrome from '@/components/theme/receipt/ReceiptChrome';
import ReceiptFooterChrome from '@/components/theme/receipt/ReceiptFooterChrome';
import ReceiptPhotoFrame from '@/components/theme/receipt/ReceiptPhotoFrame';
import PaymentProcessing from './PaymentProcessing';

interface Props {
  searchParams: Promise<{ order_id?: string }>;
}

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function CheckoutConfirmPage({ searchParams }: Props) {
  const { order_id } = await searchParams;

  if (!order_id) redirect('/');

  const user = await getCurrentUser();
  if (!user) redirect('/');

  // Ownership gate: admin can view any order, regular user only their own
  const orderWhere = user.isAdmin
    ? eq(orders.id, order_id)
    : and(eq(orders.id, order_id), eq(orders.user_id, user.id));

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
    .where(eq(order_items.order_id, order_id));

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
        }
      : null,
  }));

  const order = { ...orderRow, order_items: orderItemsMapped };

  // Deterministic codes from order ID — no randomness, stable on refresh
  const hashCode = (str: string) => [...str].reduce((a, c) => a + c.charCodeAt(0), 0);
  const transactionId = `${order.id.slice(0, 4).toUpperCase()}-${hashCode(order.id) % 9000 + 1000}`;
  const authCode = `${(hashCode(order.id) * 31 % 900000 + 100000).toString().slice(0, 6)}`;
  const register = String((hashCode(order.id) % 8) + 1).padStart(2, '0');

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const confCode = `CONF-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <ReceiptPage>
      <ReceiptChrome />
      <div className="receipt-section-bar" style={{ margin: '18px 0 4px' }}>
        <span>SALES RECEIPT</span>
        <span className="receipt-section-bar-count">{confCode}</span>
      </div>
      <div
        className="flex flex-wrap justify-between"
        style={{ gap: '2px 12px', fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)', padding: '6px 0 10px' }}
      >
        <span>DATE: {dateStr}</span>
        <span>
          STATUS:{' '}
          {order.status === 'pending' ? 'PROCESSING' : order.status === 'cancelled' ? 'VOID' : 'PAID'}
        </span>
      </div>

          {/* ── STATUS BRANCHES ── */}

          {order.status === 'pending' ? (
            <>
              <ReceiptDivider variant="major" />
              <PaymentProcessing orderId={order.id} />
              <ReceiptDivider variant="major" />
            </>
          ) : order.status === 'cancelled' ? (
            <>
              <ReceiptDivider variant="major" />
              <div className="py-4 text-center space-y-3" style={{ fontFamily: 'var(--font-display)' }}>
                <div
                  className="receipt-stamp-badge receipt-stamp-badge--red"
                  style={{ fontSize: 18, transform: 'rotate(-3deg)' }}
                >
                  PAYMENT FAILED
                </div>
                <div className="text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
                  Your order could not be completed. No charge was made.
                </div>
              </div>
              <ReceiptDivider variant="major" />
              {orderItemsMapped[0]?.item?.sku && (
                <div className="py-3 flex justify-center">
                  <Link href={`/checkout?sku=${orderItemsMapped[0].item.sku}`} className="receipt-action-btn">
                    TRY AGAIN
                  </Link>
                </div>
              )}
              <ReceiptDivider variant="major" />
            </>
          ) : (
            <>
              {/* ── SUCCESS RECEIPT ── */}

              {/* PAID stamp */}
              <div className="flex justify-center py-3">
                <div
                  className="receipt-stamp-badge"
                  style={{
                    fontSize: 28,
                    color: 'var(--success)',
                    borderColor: 'var(--success)',
                    transform: 'rotate(-3deg)',
                    padding: '6px 22px',
                  }}
                >
                  PAID
                </div>
              </div>

              {/* Polaroid stack */}
              {orderItemsMapped.length > 0 && (() => {
                const itemsWithImages = orderItemsMapped.filter((oi) => oi.item?.images && oi.item.images.length > 0);
                const visibleItems = itemsWithImages.slice(0, 3);
                const extraCount = itemsWithImages.length - visibleItems.length;
                if (visibleItems.length === 0) return null;
                return (
                  <div className="py-4">
                    <div className="flex flex-col items-center" style={{ gap: 16 }}>
                      {visibleItems.map((oi) => {
                        const it = oi.item!;
                        return (
                          <ReceiptPhotoFrame
                            key={oi.id}
                            src={it.images![0]}
                            alt={it.title ?? ''}
                            title={it.title ?? ''}
                            size="lg"
                          />
                        );
                      })}
                      {extraCount > 0 && (
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', textAlign: 'center', color: 'var(--ink-muted)', marginTop: '8px' }}>
                          + {extraCount} MORE
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              <ReceiptDivider variant="major" />

              {/* Order codes */}
              <div
                className="py-2 space-y-1 text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <div>TRANSACTION ID: {transactionId}</div>
                <div>AUTH CODE: {authCode}</div>
                <div>REGISTER: {register} &nbsp;·&nbsp; CASHIER: TOR</div>
                <div>ORDER: {order.id.slice(0, 8).toUpperCase()}</div>
                <div>DATE: {formatReceiptTimestamp(order.created_at)}</div>
              </div>

              {/* Items */}
              <div className="receipt-section-bar" style={{ margin: '10px 0 8px' }}>
                <span>ITEMS PURCHASED</span>
              </div>
              <div className="py-2 space-y-1" style={{ fontFamily: 'var(--font-display)' }}>
                {orderItemsMapped.map((oi) => {
                  const it = oi.item;
                  return (
                    <div
                      key={oi.id}
                      className="receipt-line-item"
                      style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}
                    >
                      <span style={{ color: 'var(--ink)' }}>{it?.title ?? 'ITEM'}</span>
                      <span className="leader" aria-hidden="true" />
                      <span className="receipt-price" style={{ color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                        {formatCents(oi.price_cents)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <ReceiptDivider variant="major" />
              <div
                className="text-[0.5rem] uppercase text-center tracking-[0.25em] py-1"
                style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink-muted)' }}
              >
                *** END OF SALE ***
              </div>
              <ReceiptDivider variant="minor" />
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
                  <span className="uppercase">TAX</span>
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
                  <div className="receipt-section-bar" style={{ margin: '10px 0 8px' }}>
                    <span>SOLD TO</span>
                  </div>
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

              {/* Receipt tear */}
              <div className="receipt-tear" />

              <div
                className="py-2 space-y-0.5 text-center"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <div className="text-[0.75rem] uppercase tracking-widest font-bold" style={{ color: 'var(--ink)' }}>
                  ★ KEEP THIS RECEIPT ★
                </div>
                <div className="text-[0.5rem] uppercase tracking-widest">A confirmation email has been sent.</div>
                <div className="text-[0.5rem] uppercase tracking-widest">HANDMADE WITH CARE — SHIPS IN 5-7 DAYS</div>
              </div>

              <div className="py-3 flex gap-4 flex-wrap items-center justify-center">
                <Link href={`/account/orders/${order.id}`} className="receipt-action-btn">
                  VIEW ORDER
                </Link>
                <Link href="/browse" className="receipt-view-item-link">
                  BROWSE MORE →
                </Link>
              </div>
            </>
          )}
      <ReceiptFooterChrome barcodeSeed={order.id} />
    </ReceiptPage>
  );
}
