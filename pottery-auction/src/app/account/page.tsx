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
    <div style={{ backgroundColor: 'var(--bg-well)', minHeight: '100vh', padding: '32px 16px 80px' }}>
      <div
        className="receipt-strip-paper"
        style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}
      >
        {/* Top-right stamp: LEDGER */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 62,
            right: 16,
            zIndex: 3,
            fontFamily: 'var(--font-stamp)',
            color: '#335a7a',
            border: '2.5px solid #335a7a',
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
          LEDGER
          <div style={{ fontSize: '0.4rem', letterSpacing: '0.22em', marginTop: 2 }}>● ACCOUNT FILE ●</div>
        </div>

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
              ★ CUSTOMER LEDGER ★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★★★ ACCOUNT RECORD ★★★
            </div>

            <ReceiptDivider variant="decorative" />

            <div
              className="text-[0.6875rem] mt-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ACCT: {accountNo}
            </div>
            <div
              className="text-[0.6875rem]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              DATE: {dateStr}
            </div>
          </div>

          {/* ── ACCOUNT INFO ── */}
          <ReceiptDivider variant="major" />
          <div
            className="text-[0.625rem] uppercase tracking-widest pb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            ACCOUNT INFO
          </div>
          <ReceiptDivider variant="minor" />
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
          <ReceiptDivider variant="major" />
          <div
            className="text-[0.625rem] uppercase tracking-widest pb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            ORDER HISTORY ({allOrders.length})
          </div>
          <ReceiptDivider variant="minor" />

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

          {/* Receipt tear */}
          <div className="receipt-tear" />

          <div
            className="py-1 space-y-0.5 text-center"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            <div className="text-[0.625rem] uppercase tracking-widest">
              {allOrders.length} {allOrders.length === 1 ? 'ORDER' : 'ORDERS'} ON FILE
            </div>
            <div className="text-[0.5rem] uppercase tracking-widest">HANDMADE WITH CARE · ALL SALES FINAL</div>
          </div>

          <ReceiptDivider variant="major" />
          <Barcode seed={user.id} className="mx-auto mt-2" />

          <div className="py-3 flex gap-4 flex-wrap items-center">
            <Link href="/browse">
              <button
                className="font-mono text-[0.875rem] uppercase hover:opacity-70"
                style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}
              >
                {'< BROWSE MORE >'}
              </button>
            </Link>
          </div>

          <ReceiptDivider variant="major" />
          <div
            className="text-[0.45rem] text-center uppercase tracking-widest pb-2"
            style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
          >
            © TOR&apos;S BORED POTTERY CO. · BROOKLYN, NY
          </div>
        </div>
        <div className="receipt-edge-bottom" />
      </div>
    </div>
  );
}
