import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { bids, items, auctions, orders, order_items, profiles } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { formatReceiptTimestamp, formatReceiptDate } from '@/lib/format/receipt-timestamp';
import Y2KAccountPage from '@/components/theme/y2k/Y2KAccountPage';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptChrome from '@/components/theme/receipt/ReceiptChrome';
import ReceiptFooterChrome from '@/components/theme/receipt/ReceiptFooterChrome';
import Barcode from '@/components/theme/receipt/Barcode';

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Inline status stamp ──────────────────────────────────────────────────────

function StatusStamp({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-stamp)',
        color,
        border: `1.5px solid ${color}`,
        borderRadius: 2,
        padding: '0px 5px',
        fontSize: '0.6rem',
        letterSpacing: '0.12em',
        lineHeight: 1.6,
        mixBlendMode: 'multiply',
        opacity: 0.85,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function getStatusStamp(status: string) {
  switch (status) {
    case 'paid':      return <StatusStamp label="PAID"      color="#335a7a" />;
    case 'shipped':   return <StatusStamp label="SHIPPED"   color="#2e7d32" />;
    case 'delivered': return <StatusStamp label="DELIVERED" color="#2e7d32" />;
    case 'cancelled': return <StatusStamp label="CANCELLED" color="var(--error)" />;
    default:          return <StatusStamp label="PENDING"   color="var(--ink-muted)" />;
  }
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  // Fetch profile created_at separately (getCurrentUser doesn't include it)
  const [profileRow] = await db
    .select({ created_at: profiles.created_at })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);
  const profileCreatedAt = profileRow?.created_at ?? new Date();

  const now = new Date();

  // Fetch bids with item+auction join
  const bidRows = await db
    .select({ b: bids, i: items, a: auctions })
    .from(bids)
    .leftJoin(items, eq(bids.item_id, items.id))
    .leftJoin(auctions, eq(items.auction_id, auctions.id))
    .where(eq(bids.user_id, user.id))
    .orderBy(desc(bids.created_at))
    .limit(20);

  // Reconstruct nested bid shape: bid.item.auction
  const allBids = bidRows.map((r) => ({
    id: r.b.id,
    amount: r.b.amount,
    status: r.b.status,
    created_at: r.b.created_at,
    item_id: r.b.item_id,
    item: r.i
      ? {
          id: r.i.id,
          sku: r.i.sku,
          title: r.i.title,
          listing_type: r.i.listing_type,
          auction_id: r.i.auction_id,
          auction: r.a
            ? {
                end_date: r.a.end_date,
                extended_end_date: r.a.extended_end_date,
                status: r.a.status,
              }
            : null,
        }
      : null,
  }));

  // Fetch orders (no items yet — fetch separately to avoid duplicates)
  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.user_id, user.id))
    .orderBy(desc(orders.created_at))
    .limit(10);

  // Fetch order_items with items join for all fetched orders
  const allOrders = await (async () => {
    if (orderRows.length === 0) return [];
    const orderIds = orderRows.map((o) => o.id);
    const oiRows = await db
      .select({ oi: order_items, i: items })
      .from(order_items)
      .leftJoin(items, eq(order_items.item_id, items.id))
      .where(inArray(order_items.order_id, orderIds));

    // Group order_items by order_id
    const oiByOrder = new Map<string, typeof oiRows>();
    for (const row of oiRows) {
      const list = oiByOrder.get(row.oi.order_id) ?? [];
      list.push(row);
      oiByOrder.set(row.oi.order_id, list);
    }

    return orderRows.map((o) => ({
      ...o,
      order_items: (oiByOrder.get(o.id) ?? []).map((r) => ({
        id: r.oi.id,
        price_cents: r.oi.price_cents,
        source: r.oi.source,
        item: r.i
          ? { id: r.i.id, sku: r.i.sku, title: r.i.title }
          : null,
      })),
    }));
  })();

  const activeBids = allBids.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const wonBids = allBids.filter((b) => b.status === 'won');
  const outbidBids = allBids.filter((b) => b.status === 'outbid').slice(0, 5);

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme === 'y2k') {
    return (
      <Y2KAccountPage
        user={{ email: user.email, created_at: profileCreatedAt.toISOString() }}
        activeBids={activeBids}
        wonBids={wonBids}
        outbidBids={outbidBids}
        orders={allOrders}
      />
    );
  }

  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  // Use first 8 chars of user.id as account number
  const accountNo = user.id.slice(0, 8).toUpperCase();

  return (
    <ReceiptPage>
      <ReceiptChrome />
      <div className="receipt-section-bar" style={{ margin: '18px 0 4px' }}>
        <span>CUSTOMER LEDGER</span>
        <span className="receipt-section-bar-count">ACCT {accountNo}</span>
      </div>
      <div
        className="flex flex-wrap justify-between"
        style={{ gap: '2px 12px', fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)', padding: '6px 0 10px' }}
      >
        <span>ACCOUNT RECORD</span>
        <span>DATE: {dateStr}</span>
      </div>

          {/* ── ACCOUNT INFO ── */}
          <div className="receipt-section-bar" style={{ margin: '4px 0 8px' }}>
            <span>ACCOUNT INFO</span>
          </div>
          <div className="py-2 space-y-1">
            <div
              className="receipt-line-item"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">ACCOUNT NO.</span>
              <span className="leader" aria-hidden="true" />
              <span style={{ color: 'var(--ink)' }}>{accountNo}</span>
            </div>
            <div
              className="receipt-line-item"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">EMAIL</span>
              <span className="leader" aria-hidden="true" />
              <span style={{ color: 'var(--ink)' }}>{user.email}</span>
            </div>
            <div
              className="receipt-line-item"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">MEMBER SINCE</span>
              <span className="leader" aria-hidden="true" />
              <span style={{ color: 'var(--ink)' }}>{formatReceiptDate(profileCreatedAt)}</span>
            </div>
            <div
              className="receipt-line-item"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">ORDERS ON FILE</span>
              <span className="leader" aria-hidden="true" />
              <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-thermal)', fontSize: '1rem' }}>{allOrders.length}</span>
            </div>
            <div
              className="receipt-line-item"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">ACTIVE BIDS</span>
              <span className="leader" aria-hidden="true" />
              <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-thermal)', fontSize: '1rem' }}>{activeBids.length}</span>
            </div>
          </div>

          {/* ── ACTIVE BIDS ── */}
          {activeBids.length > 0 && (
            <>
              <ReceiptDivider variant="major" />
              <div
                className="text-[0.625rem] uppercase tracking-widest pb-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                MY BIDS — ACTIVE ({activeBids.length})
              </div>
              <ReceiptDivider variant="minor" />
              <div className="py-2 space-y-2" style={{ fontFamily: 'var(--font-display)' }}>
                {activeBids.map((bid) => {
                  const item = bid.item;
                  const auctionEnded = item?.auction?.status !== 'active';
                  return (
                    <div key={bid.id}>
                      <div
                        className="receipt-line-item"
                        style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}
                      >
                        <Link href={`/piece/${item?.sku}`} className="hover:underline" style={{ color: 'var(--ink)' }}>
                          {item?.title ?? bid.item_id}
                        </Link>
                        <span className="leader" aria-hidden="true" />
                        <span
                          style={{
                            color: 'var(--ink)',
                            fontFamily: 'var(--font-thermal)',
                            fontSize: '1rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatPrice(bid.amount)}
                        </span>
                      </div>
                      <div
                        className="flex gap-2 items-center text-[0.6875rem] mt-0.5"
                        style={{ color: 'var(--ink-muted)' }}
                      >
                        <span>{item?.sku}</span>
                        <span>·</span>
                        <span>{formatReceiptTimestamp(bid.created_at)}</span>
                        {auctionEnded && (
                          <StatusStamp label="ENDED" color="var(--ink-muted)" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── WON ITEMS ── */}
          {wonBids.length > 0 && (
            <>
              <ReceiptDivider variant="major" />
              <div
                className="text-[0.625rem] uppercase tracking-widest pb-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                MY BIDS — WON ({wonBids.length})
              </div>
              <ReceiptDivider variant="minor" />
              <div className="py-2 space-y-2" style={{ fontFamily: 'var(--font-display)' }}>
                {wonBids.map((bid) => {
                  const item = bid.item;
                  return (
                    <div key={bid.id}>
                      <div
                        className="receipt-line-item"
                        style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}
                      >
                        <Link href={`/piece/${item?.sku}`} className="hover:underline" style={{ color: 'var(--ink)' }}>
                          {item?.title ?? bid.item_id}
                        </Link>
                        <span className="leader" aria-hidden="true" />
                        <span className="flex items-center gap-2">
                          <span
                            style={{
                              color: 'var(--ink)',
                              fontFamily: 'var(--font-thermal)',
                              fontSize: '1rem',
                            }}
                          >
                            {formatPrice(bid.amount)}
                          </span>
                          <StatusStamp label="WON" color="#2e7d32" />
                        </span>
                      </div>
                      <div
                        className="text-[0.6875rem] mt-0.5"
                        style={{ color: 'var(--ink-muted)' }}
                      >
                        {item?.sku} · {formatReceiptTimestamp(bid.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── RECENTLY OUTBID ── */}
          {outbidBids.length > 0 && (
            <>
              <ReceiptDivider variant="major" />
              <div
                className="text-[0.625rem] uppercase tracking-widest pb-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                MY BIDS — OUTBID
              </div>
              <ReceiptDivider variant="minor" />
              <div className="py-2 space-y-1" style={{ fontFamily: 'var(--font-display)' }}>
                {outbidBids.map((bid) => {
                  const item = bid.item;
                  return (
                    <div
                      key={bid.id}
                      className="receipt-line-item"
                      style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)' }}
                    >
                      <Link href={`/piece/${item?.sku}`} className="hover:underline">
                        {item?.title ?? bid.item_id}
                      </Link>
                      <span className="leader" aria-hidden="true" />
                      <span className="flex items-center gap-2">
                        <span>{formatPrice(bid.amount)}</span>
                        <StatusStamp label="OUTBID" color="var(--error)" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── ORDER HISTORY ── */}
          <div className="receipt-section-bar" style={{ margin: '16px 0 8px' }}>
            <span>ORDER HISTORY</span>
            <span className="receipt-section-bar-count">QTY {allOrders.length}</span>
          </div>

          {allOrders.length === 0 ? (
            <div
              className="py-4 text-[0.875rem] text-center uppercase"
              style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
            >
              NO ORDERS ON FILE
            </div>
          ) : (
            <div className="py-2 space-y-0" style={{ fontFamily: 'var(--font-display)' }}>
              {allOrders.map((order, i) => {
                const firstItem = order.order_items?.[0]?.item;
                return (
                  <div key={order.id}>
                    {i > 0 && <ReceiptDivider variant="minor" />}
                    <Link href={`/account/orders/${order.id}`} className="block py-2 hover:opacity-70">
                      <div
                        className="receipt-line-item"
                        style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}
                      >
                        <span className="font-semibold uppercase" style={{ color: 'var(--ink)' }}>
                          {order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="leader" aria-hidden="true" />
                        <span className="flex items-center gap-2">
                          <span
                            style={{
                              color: 'var(--ink)',
                              fontFamily: 'var(--font-thermal)',
                              fontSize: '1rem',
                            }}
                          >
                            {formatCents(order.total_cents)}
                          </span>
                          {getStatusStamp(order.status)}
                        </span>
                      </div>
                      <div
                        className="text-[0.6875rem] uppercase mt-0.5"
                        style={{ color: 'var(--ink-muted)' }}
                      >
                        {firstItem?.title ?? 'ORDER'} · {formatReceiptDate(order.created_at)}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="py-3 flex justify-center">
            <Link href="/browse" className="receipt-view-item-link">
              ← BROWSE MORE
            </Link>
          </div>

      <ReceiptFooterChrome barcodeSeed={user.id} />
    </ReceiptPage>
  );
}
