import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { formatReceiptTimestamp } from '@/lib/format/receipt-timestamp';
import HanddrawnPieceDetail from '@/components/theme/handdrawn/HanddrawnPieceDetail';
import Y2KPieceDetail from '@/components/theme/y2k/Y2KPieceDetail';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import PolaroidPhoto from '@/components/theme/receipt/PolaroidPhoto';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface Props {
  params: Promise<{ sku: string }>;
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

function getRemainingTime(endDateStr: string | null | undefined): string {
  if (!endDateStr) return '—';
  const diff = new Date(endDateStr).getTime() - Date.now();
  if (diff <= 0) return 'ENDED';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h}H ${String(m).padStart(2, '0')}M ${String(s).padStart(2, '0')}S`;
}

function isCurrentlyReserved(item: any): boolean {
  return item.reserved_until && new Date(item.reserved_until) > new Date() && !item.sold_at;
}

export default async function PiecePage({ params }: Props) {
  const { sku } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from('items')
    .select('*, auction:auctions(id, end_date, extended_end_date, status, reserve_price)')
    .eq('sku', sku)
    .maybeSingle();

  if (!item) notFound();

  const { data: bids } = await supabase
    .from('bids')
    .select('id, amount, status, created_at, user_id')
    .eq('item_id', item.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  const isSold = !!item.sold_at;
  const isReserved = isCurrentlyReserved(item);
  const isAuction = item.listing_type === 'auction';
  const isBuyNow = item.listing_type === 'buy_now';
  const auction = item.auction;
  const auctionActive = auction?.status === 'active';
  const endDate = auction?.extended_end_date ?? auction?.end_date;
  const reserveMet = !auction?.reserve_price || (item.current_bid ?? 0) >= auction.reserve_price;
  const now = new Date();

  if (theme === 'handdrawn') {
    return <HanddrawnPieceDetail item={item} bids={bids ?? []} sku={sku} />;
  }

  if (theme === 'y2k') {
    return <Y2KPieceDetail item={item} bids={bids ?? []} sku={sku} />;
  }

  return (
    <ReceiptPage>
      <ReceiptHeader ticket={`${sku}`} date={now} />

      {/* Photo */}
      <div className="py-4">
        {item.images?.[0] ? (
          <PolaroidPhoto src={item.images[0]} alt={item.title} sku={item.sku ?? undefined} caption={item.title} />
        ) : (
          <div
            className="border border-[var(--border)] p-12 text-center text-[0.875rem] uppercase"
            style={{ color: 'var(--ink-muted)', backgroundColor: 'var(--bg-well)' }}
          >
            [NO IMAGE ON FILE]
          </div>
        )}
      </div>

      {/* Item description */}
      <ReceiptDivider variant="major" />
      <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
        ITEM DESCRIPTION
      </div>
      <ReceiptDivider variant="major" />
      <div className="py-2 text-[0.875rem] space-y-0.5" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>SKU</span>
          <span className="font-semibold">{item.sku}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>ITEM</span>
          <span>{item.title}</span>
        </div>
        {item.description && (
          <div className="flex gap-3">
            <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>DESC</span>
            <span className="text-[0.875rem]">{item.description}</span>
          </div>
        )}
        {item.techniques?.length > 0 && (
          <div className="flex gap-3">
            <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>TECHNIQUE</span>
            <span className="uppercase">{item.techniques.join(', ')}</span>
          </div>
        )}
        {item.dimensions && typeof item.dimensions === 'object' && !Array.isArray(item.dimensions) && (
          <div className="flex gap-3">
            <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>DIMENSIONS</span>
            <span className="uppercase">
              {(() => {
                const d = item.dimensions as Record<string, unknown>;
                return [
                  d.height && `${d.height}" H`,
                  d.width && `${d.width}" W`,
                  d.depth && `${d.depth}" D`,
                ].filter(Boolean).join(' x ');
              })()}
            </span>
          </div>
        )}
        {item.weight && (
          <div className="flex gap-3">
            <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>WEIGHT</span>
            <span className="uppercase">{item.weight} OZ</span>
          </div>
        )}
      </div>

      {/* Pricing / status */}
      <ReceiptDivider variant="major" />
      <div className="py-2 space-y-1 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)' }}>
        {isAuction ? (
          <>
            <div className="flex justify-between">
              <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>STARTING BID</span>
              <span className="receipt-price font-semibold" style={{ color: 'var(--ink)' }}>{formatPrice(item.starting_bid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>CURRENT BID</span>
              <span className="receipt-price font-bold" style={{ color: 'var(--ink)' }}>{formatPrice(item.current_bid)}</span>
            </div>
            {auctionActive && endDate && (
              <div className="flex justify-between">
                <span className="uppercase" style={{ color: 'var(--error)' }}>TIME REMAINING</span>
                <span className="receipt-price font-bold" style={{ color: 'var(--error)' }}>{getRemainingTime(endDate)}</span>
              </div>
            )}
            {!auctionActive && (
              <div className="flex justify-between">
                <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>STATUS</span>
                <span style={{ color: 'var(--ink-muted)' }}>AUCTION ENDED</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>BIDS PLACED</span>
              <span style={{ color: 'var(--ink)' }}>{bids?.length ?? 0}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>BUY NOW PRICE</span>
              <span className="receipt-price font-bold" style={{ color: 'var(--ink)' }}>{formatPrice(item.buy_now_price)}</span>
            </div>
            {isSold && (
              <div className="flex justify-between">
                <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>STATUS</span>
                <span style={{ color: 'var(--error)' }}>SOLD</span>
              </div>
            )}
            {isReserved && !isSold && (
              <div className="flex justify-between">
                <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>STATUS</span>
                <span style={{ color: 'var(--ink-muted)' }}>RESERVED — AVAILABLE SOON</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reserve not met warning */}
      {isAuction && !reserveMet && auctionActive && (
        <>
          <ReceiptDivider variant="minor" />
          <div className="py-2 text-[0.875rem]" style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}>
            ┌──────────────────────────────┐<br />
            │&nbsp;&nbsp;RESERVE NOT MET&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
            │&nbsp;&nbsp;Current bid is below the&nbsp;&nbsp;&nbsp;&nbsp;│<br />
            │&nbsp;&nbsp;reserve price.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
            └──────────────────────────────┘
          </div>
        </>
      )}

      {/* Actions */}
      <ReceiptDivider variant="major" />
      <div className="py-3 flex gap-4 flex-wrap items-center">
        {isAuction && auctionActive && (
          <Button intent="primary">[ PLACE BID ]</Button>
        )}
        {isBuyNow && !isSold && !isReserved && (
          <Link href={`/checkout?sku=${sku}`}>
            <Button intent="primary">[ BUY NOW ]</Button>
          </Link>
        )}
        {(isSold || (isReserved && !isSold)) && (
          <Badge intent="error">
            {isSold ? 'SOLD' : 'TEMPORARILY UNAVAILABLE'}
          </Badge>
        )}
        <Link href="/browse">
          <Button intent="secondary">{'< BROWSE MORE >'}</Button>
        </Link>
      </div>
      <ReceiptDivider variant="major" />

      {/* Bid history */}
      {isAuction && bids && bids.length > 0 && (
        <>
          <div className="py-2 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
            BID HISTORY — {sku}
          </div>
          <ReceiptDivider variant="major" />
          <div className="space-y-0.5 py-2 text-[0.6875rem]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            {bids.map((bid, i) => {
              const isTopBid = i === 0;
              const badgeIntent = isTopBid ? 'current' : 'outbid';
              const label = isTopBid ? 'CURRENT' : 'OUTBID';
              return (
                <div key={bid.id} className="flex gap-3 justify-between items-baseline py-0.5">
                  <span style={{ color: 'var(--ink-muted)' }}>{formatReceiptTimestamp(bid.created_at)}</span>
                  <span className="font-semibold">{formatPrice(bid.amount)}</span>
                  <Badge intent={badgeIntent}>{label}</Badge>
                </div>
              );
            })}
          </div>
          <ReceiptDivider variant="major" />
          <div className="py-1 text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
            {bids.length} {bids.length === 1 ? 'BID' : 'BIDS'} PLACED
          </div>
          <ReceiptDivider variant="major" />
        </>
      )}

      <ReceiptFooter />
    </ReceiptPage>
  );
}
