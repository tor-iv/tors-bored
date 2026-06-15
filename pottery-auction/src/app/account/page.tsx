import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { bids, items, auctions, orders, order_items, profiles } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { formatReceiptTimestamp, formatReceiptDate } from '@/lib/format/receipt-timestamp';
import Y2KAccountPage from '@/components/theme/y2k/Y2KAccountPage';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import Badge from '@/components/ui/Badge';

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

function getOrderStatusBadgeIntent(status: string): 'current' | 'outbid' | 'error' | 'won' {
  switch (status) {
    case 'paid': return 'current';
    case 'shipped': return 'won';
    case 'delivered': return 'won';
    case 'cancelled': return 'error';
    default: return 'outbid';
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

  return (
    <ReceiptPage>
      <ReceiptHeader ticket="MY-ACCOUNT" date={now} />

      {/* Account info */}
      <ReceiptDivider variant="major" />
      <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
        ACCOUNT INFO
      </div>
      <ReceiptDivider variant="major" />
      <div className="py-2 space-y-0.5 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>EMAIL</span>
          <span>{user.email}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>MEMBER SINCE</span>
          <span>{formatReceiptDate(profileCreatedAt)}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>ORDERS</span>
          <span>{allOrders.length}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>ACTIVE BIDS</span>
          <span>{activeBids.length}</span>
        </div>
      </div>

      {/* Active bids */}
      {activeBids.length > 0 && (
        <>
          <ReceiptDivider variant="major" />
          <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
            ACTIVE BIDS ({activeBids.length})
          </div>
          <ReceiptDivider variant="major" />
          <div className="space-y-0.5 py-2" style={{ fontFamily: 'var(--font-display)' }}>
            {activeBids.map((bid) => {
              const item = bid.item;
              const auctionEnded = item?.auction?.status !== 'active';
              return (
                <div key={bid.id} className="py-1">
                  <div className="flex gap-2 justify-between items-baseline text-[0.875rem]">
                    <Link href={`/piece/${item?.sku}`} className="font-semibold hover:underline" style={{ color: 'var(--ink)' }}>
                      {item?.title ?? bid.item_id}
                    </Link>
                    <span className="text-[0.875rem] font-bold" style={{ color: 'var(--ink)' }}>{formatPrice(bid.amount)}</span>
                  </div>
                  <div className="flex gap-2 items-center text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
                    <span>{item?.sku}</span>
                    <span>·</span>
                    <span>{formatReceiptTimestamp(bid.created_at)}</span>
                    {auctionEnded && <Badge intent="outbid">AUCTION ENDED</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Won items */}
      {wonBids.length > 0 && (
        <>
          <ReceiptDivider variant="major" />
          <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
            WON ITEMS ({wonBids.length})
          </div>
          <ReceiptDivider variant="major" />
          <div className="space-y-0.5 py-2" style={{ fontFamily: 'var(--font-display)' }}>
            {wonBids.map((bid) => {
              const item = bid.item;
              return (
                <div key={bid.id} className="py-1">
                  <div className="flex gap-2 justify-between items-baseline text-[0.875rem]">
                    <Link href={`/piece/${item?.sku}`} className="font-semibold hover:underline" style={{ color: 'var(--ink)' }}>
                      {item?.title ?? bid.item_id}
                    </Link>
                    <Badge intent="won">WON</Badge>
                  </div>
                  <div className="flex gap-2 items-center text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
                    <span>{item?.sku}</span>
                    <span>·</span>
                    <span className="font-semibold" style={{ color: 'var(--ink)' }}>{formatPrice(bid.amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Outbid items */}
      {outbidBids.length > 0 && (
        <>
          <ReceiptDivider variant="major" />
          <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink-muted)' }}>
            RECENTLY OUTBID
          </div>
          <ReceiptDivider variant="minor" />
          <div className="space-y-0.5 py-2" style={{ fontFamily: 'var(--font-display)' }}>
            {outbidBids.map((bid) => {
              const item = bid.item;
              return (
                <div key={bid.id} className="flex gap-2 justify-between items-baseline py-0.5 text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
                  <Link href={`/piece/${item?.sku}`} className="hover:underline">
                    {item?.title ?? bid.item_id}
                  </Link>
                  <span>{formatPrice(bid.amount)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Orders */}
      <ReceiptDivider variant="major" />
      <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
        ORDER HISTORY
      </div>
      <ReceiptDivider variant="major" />

      {allOrders.length === 0 ? (
        <div className="py-4 text-[0.875rem] text-center uppercase" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}>
          NO ORDERS YET
        </div>
      ) : (
        <div className="py-2 space-y-0 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)' }}>
          {allOrders.map((order, i) => {
            const firstItem = order.order_items?.[0]?.item;
            return (
              <div key={order.id}>
                {i > 0 && <ReceiptDivider variant="minor" />}
                <Link href={`/account/orders/${order.id}`} className="block py-2 hover:opacity-70">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold uppercase" style={{ color: 'var(--ink)' }}>
                      {order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <Badge intent={getOrderStatusBadgeIntent(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-baseline mt-0.5">
                    <span className="text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
                      {firstItem?.title ?? 'ORDER'} · {formatReceiptDate(order.created_at)}
                    </span>
                    <span className="font-bold" style={{ color: 'var(--ink)' }}>{formatCents(order.total_cents)}</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <ReceiptDivider variant="major" />
      <div className="py-2 text-[0.6875rem] text-center uppercase" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}>
        {allOrders.length} {allOrders.length === 1 ? 'ORDER' : 'ORDERS'} ON FILE
      </div>

      <ReceiptDivider variant="major" />
      <div className="py-3 flex gap-4 flex-wrap items-center">
        <Link href="/browse">
          <button className="font-mono text-[0.875rem] uppercase hover:opacity-70" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
            {'< BROWSE MORE >'}
          </button>
        </Link>
      </div>
      <ReceiptDivider variant="major" />

      <ReceiptFooter />
    </ReceiptPage>
  );
}
