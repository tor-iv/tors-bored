import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { orders, order_items, items } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { formatReceiptTimestamp } from '@/lib/format/receipt-timestamp';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import PolaroidPhoto from '@/components/theme/receipt/PolaroidPhoto';
import Barcode from '@/components/theme/receipt/Barcode';
import Badge from '@/components/ui/Badge';
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
  const now = new Date();

  // Deterministic codes from order ID — no randomness, stable on refresh
  const hashCode = (str: string) => [...str].reduce((a, c) => a + c.charCodeAt(0), 0);
  const transactionId = `${order.id.slice(0, 4).toUpperCase()}-${hashCode(order.id) % 9000 + 1000}`;
  const authCode = `${(hashCode(order.id) * 31 % 900000 + 100000).toString().slice(0, 6)}`;
  const register = String((hashCode(order.id) % 8) + 1).padStart(2, '0');

  return (
    <ReceiptPage>
      <ReceiptHeader ticket={`CONF-${order.id.slice(0, 8).toUpperCase()}`} date={now} />

      {order.status === 'pending' ? (
        <>
          <ReceiptDivider variant="major" />
          <PaymentProcessing orderId={order.id} />
          <ReceiptDivider variant="major" />
        </>
      ) : order.status === 'cancelled' ? (
        <>
          <ReceiptDivider variant="major" />
          <div className="py-4 text-center space-y-2" style={{ fontFamily: 'var(--font-display)' }}>
            <div className="text-[0.875rem] font-bold uppercase" style={{ color: 'var(--error)' }}>
              PAYMENT FAILED
            </div>
            <Badge intent="error">CANCELLED</Badge>
            <div className="text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
              Your order could not be completed. No charge was made.
            </div>
          </div>
          <ReceiptDivider variant="major" />
          {orderItemsMapped[0]?.item?.sku && (
            <div className="py-3">
              <Link href={`/checkout?sku=${orderItemsMapped[0].item.sku}`}>
                <Button intent="primary">[ TRY AGAIN ]</Button>
              </Link>
            </div>
          )}
          <ReceiptDivider variant="major" />
        </>
      ) : (
        <>
          {/* Success — full receipt */}
          {/* Polaroid stack — one per item, capped at 3 */}
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
          <div className="py-2 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)' }}>
            <div className="text-center font-bold uppercase mb-1" style={{ color: 'var(--ink)' }}>
              ORDER CONFIRMED
            </div>
            <div className="text-center text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
              Thank you for your purchase!
            </div>
          </div>

          <ReceiptDivider variant="major" />
          <div className="py-2 space-y-0.5 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            <div className="flex gap-3">
              <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>ORDER</span>
              <span className="font-semibold">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>DATE</span>
              <span>{formatReceiptTimestamp(order.created_at)}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>STATUS</span>
              <Badge intent="current">{order.status.toUpperCase()}</Badge>
            </div>
          </div>

          {/* Transaction codes */}
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', color: 'var(--ink-muted)', marginBottom: '8px' }}>
            <div>TRANSACTION ID: {transactionId}</div>
            <div>AUTH CODE: {authCode}</div>
            <div>REGISTER: {register} CASHIER: TOR</div>
          </div>

          {/* Items */}
          <ReceiptDivider variant="major" />
          <div className="py-2 space-y-1 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)' }}>
            {orderItemsMapped.map((oi) => {
              const it = oi.item;
              return (
                <div key={oi.id} className="receipt-line-item" style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--ink)' }}>{it?.title ?? 'ITEM'}</span>
                  <span className="leader" aria-hidden="true" />
                  <span className="receipt-price" style={{ color: 'var(--ink)', whiteSpace: 'nowrap' }}>{formatCents(oi.price_cents)}</span>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="receipt-stamp" style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-muted)', margin: '8px 0' }}>
            *** END OF SALE ***
          </div>
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
              <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>TAX</span>
              <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(order.tax_cents)}</span>
            </div>
            <ReceiptDivider variant="minor" />
            <div className="flex justify-between font-bold text-[1rem]">
              <span className="uppercase" style={{ color: 'var(--ink)' }}>TOTAL</span>
              <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(order.total_cents)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_name && (
            <>
              <ReceiptDivider variant="major" />
              <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
                SOLD TO
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

          <ReceiptDivider variant="major" />
          <div className="py-2 text-[0.6875rem] space-y-1" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}>
            <div className="text-center uppercase">KEEP YOUR RECEIPT</div>
            <div className="text-center">A confirmation email has been sent.</div>
            <div className="text-center uppercase">HANDMADE WITH CARE — SHIPS IN 5-7 DAYS</div>
          </div>
          <ReceiptDivider variant="major" />

          <Barcode seed={order.id} />

          <div className="py-3 flex gap-4 flex-wrap items-center">
            <Link href={`/account/orders/${order.id}`}>
              <Button intent="secondary">{'[ VIEW ORDER ]'}</Button>
            </Link>
            <Link href="/browse">
              <Button intent="secondary">{'[ BROWSE MORE ]'}</Button>
            </Link>
          </div>
          <ReceiptDivider variant="major" />
        </>
      )}

      <ReceiptFooter />
    </ReceiptPage>
  );
}
