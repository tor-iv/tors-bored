import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { formatReceiptTimestamp, formatReceiptDate } from '@/lib/format/receipt-timestamp';
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
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const now = new Date();

  const [bidsResult, ordersResult] = await Promise.all([
    supabase
      .from('bids')
      .select('id, amount, status, created_at, item_id, item:items(id, sku, title, listing_type, auction_id, auction:auctions(end_date, extended_end_date, status))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('orders')
      .select('id, status, subtotal_cents, shipping_cents, tax_cents, total_cents, created_at, order_items(id, price_cents, source, item:items(id, sku, title))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const bids = bidsResult.data ?? [];
  const orders = ordersResult.data ?? [];

  const activeBids = bids.filter((b: any) => b.status === 'pending' || b.status === 'confirmed');
  const wonBids = bids.filter((b: any) => b.status === 'won');
  const outbidBids = bids.filter((b: any) => b.status === 'outbid').slice(0, 5);

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme !== 'receipt') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
          My Account
        </h1>
        <p className="mb-8" style={{ color: 'var(--ink-muted)' }}>{user.email}</p>
        {orders.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink)' }}>Recent Orders</h2>
            {orders.map((order: any) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}
                className="block border p-4 mb-2 hover:opacity-80"
                style={{ borderColor: 'var(--border)' }}>
                <div style={{ color: 'var(--ink)' }}>{order.id.slice(0, 8).toUpperCase()} — {order.status.toUpperCase()}</div>
                <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>{formatCents(order.total_cents)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
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
          <span>{formatReceiptDate(user.created_at)}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>ORDERS</span>
          <span>{orders.length}</span>
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
            {activeBids.map((bid: any) => {
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
            {wonBids.map((bid: any) => {
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
            {outbidBids.map((bid: any) => {
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

      {orders.length === 0 ? (
        <div className="py-4 text-[0.875rem] text-center uppercase" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}>
          NO ORDERS YET
        </div>
      ) : (
        <div className="py-2 space-y-0 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)' }}>
          {orders.map((order: any, i: number) => {
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
        {orders.length} {orders.length === 1 ? 'ORDER' : 'ORDERS'} ON FILE
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
