import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { orders, order_items, items } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { formatReceiptTimestamp } from '@/lib/format/receipt-timestamp';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import PolaroidPhoto from '@/components/theme/receipt/PolaroidPhoto';
import Barcode from '@/components/theme/receipt/Barcode';
import Button from '@/components/ui/Button';
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
    <div style={{ backgroundColor: 'var(--bg-well)', minHeight: '100vh', padding: '32px 16px 80px' }}>
      <div
        className="receipt-strip-paper"
        style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}
      >
        {/* Top-right stamp: changes based on status */}
        {order.status !== 'pending' && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 62,
              right: 16,
              zIndex: 3,
              fontFamily: 'var(--font-stamp)',
              color: order.status === 'cancelled' ? 'var(--error)' : '#2e7d32',
              border: `2.5px solid ${order.status === 'cancelled' ? 'var(--error)' : '#2e7d32'}`,
              borderRadius: 3,
              padding: '3px 10px 2px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              lineHeight: 1.1,
              textAlign: 'center',
              mixBlendMode: 'multiply',
              pointerEvents: 'none',
              opacity: 0.85,
            }}
          >
            {order.status === 'cancelled' ? 'VOID' : 'PAID'}
            <div style={{ fontSize: '0.4rem', letterSpacing: '0.22em', marginTop: 2 }}>
              {order.status === 'cancelled' ? '● ORDER CANCELLED ●' : '● PAYMENT RECEIVED ●'}
            </div>
          </div>
        )}

        {/* Top-left circular date stamp */}
        <div
          aria-hidden
          className="receipt-date-stamp"
          style={{
            position: 'absolute',
            top: 58,
            left: 14,
            zIndex: 3,
            pointerEvents: 'none',
            opacity: 0.52,
            transform: 'rotate(8deg)',
          }}
        >
          <div style={{ fontSize: '0.38rem', letterSpacing: '0.1em', lineHeight: 1.4 }}>
            <div>RECEIVED</div>
            <div style={{ fontSize: '0.52rem', letterSpacing: '0.06em', fontWeight: 'bold' }}>
              {dateStr}
            </div>
            <div>STUDIO</div>
          </div>
        </div>

        <div className="receipt-edge-top" />
        <div className="receipt-strip-content py-6">

          {/* ── HEADER BLOCK ── */}
          <div className="text-center pb-3" style={{ lineHeight: 1.45 }}>
            <div
              className="text-[0.625rem] uppercase tracking-[0.3em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              TOR&apos;S BORED POTTERY CO.
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★ EST. BROOKLYN, NY ★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-widest mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              CASHIER: TOR &nbsp;·&nbsp; REG #04 &nbsp;·&nbsp; MEMBER: ✓
            </div>

            <ReceiptDivider variant="decorative" />

            <div
              className="receipt-stamp text-[1.15rem] uppercase tracking-wide py-1"
              style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
            >
              ★ SALES RECEIPT ★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★★★ HANDMADE POTTERY ★★★
            </div>

            <ReceiptDivider variant="decorative" />

            <div
              className="text-[0.6875rem] mt-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              {confCode}
            </div>
            <div
              className="text-[0.6875rem]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              DATE: {dateStr}
            </div>
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
                {/* Big VOID stamp */}
                <div
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-stamp)',
                    color: 'var(--error)',
                    border: '3px solid var(--error)',
                    borderRadius: 3,
                    padding: '6px 20px 5px',
                    fontSize: '1.8rem',
                    letterSpacing: '0.16em',
                    transform: 'rotate(-3deg)',
                    mixBlendMode: 'multiply',
                    opacity: 0.85,
                  }}
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
                  <Link href={`/checkout?sku=${orderItemsMapped[0].item.sku}`}>
                    <button
                      className="receipt-stamp uppercase tracking-widest px-8 py-2.5 text-[0.9rem] border border-current"
                      style={{
                        fontFamily: 'var(--font-stamp)',
                        color: 'var(--ink)',
                        transform: 'rotate(-0.5deg)',
                        boxShadow: '3px 3px 0 var(--ink)',
                      }}
                    >
                      [ TRY AGAIN ]
                    </button>
                  </Link>
                </div>
              )}
              <ReceiptDivider variant="major" />
            </>
          ) : (
            <>
              {/* ── SUCCESS RECEIPT ── */}

              {/* Big PAID rubber stamp */}
              <div className="flex justify-center py-2">
                <div
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-stamp)',
                    color: '#2e7d32',
                    border: '4px solid #2e7d32',
                    borderRadius: 4,
                    padding: '8px 28px 6px',
                    fontSize: '2.8rem',
                    letterSpacing: '0.18em',
                    transform: 'rotate(-3deg)',
                    mixBlendMode: 'multiply',
                    opacity: 0.82,
                    lineHeight: 1,
                  }}
                >
                  PAID
                  <div style={{ fontSize: '0.5rem', letterSpacing: '0.26em', textAlign: 'center', marginTop: 2 }}>
                    ● THANK YOU ●
                  </div>
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
                    <div className="receipt-polaroid-stack">
                      {visibleItems.map((oi) => {
                        const it = oi.item!;
                        return (
                          <PolaroidPhoto
                            key={oi.id}
                            src={it.images![0]}
                            alt={it.title ?? ''}
                            sku={it.sku ?? undefined}
                            caption={it.title ?? undefined}
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
              <ReceiptDivider variant="major" />
              <div
                className="text-[0.625rem] uppercase tracking-widest pb-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                ITEMS PURCHASED
              </div>
              <ReceiptDivider variant="minor" />
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
                  <ReceiptDivider variant="major" />
                  <div
                    className="text-[0.625rem] uppercase tracking-widest pb-1"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
                  >
                    SOLD TO
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

              <ReceiptDivider variant="major" />
              <Barcode seed={order.id} className="mx-auto mt-2" />

              <div className="py-3 flex gap-4 flex-wrap items-center">
                <Link href={`/account/orders/${order.id}`}>
                  <Button intent="secondary">{'[ VIEW ORDER ]'}</Button>
                </Link>
                <Link href="/browse">
                  <Button intent="secondary">{'[ BROWSE MORE ]'}</Button>
                </Link>
              </div>
              <ReceiptDivider variant="major" />

              <div
                className="text-[0.45rem] text-center uppercase tracking-widest pb-2"
                style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
              >
                © TOR&apos;S BORED POTTERY CO. · BROOKLYN, NY
              </div>
            </>
          )}
        </div>
        <div className="receipt-edge-bottom" />
      </div>
    </div>
  );
}
