import Link from 'next/link';
import ReceiptDivider from './ReceiptDivider';
import { formatReceiptTimestamp } from '@/lib/format/receipt-timestamp';

interface BrowseItem {
  id: string;
  sku: string;
  title: string;
  listingType: 'auction' | 'buy_now';
  buyNowPrice?: number;
  currentBid?: number;
  startingBid?: number;
  endDate?: string;
  soldAt?: string | null;
  reservedUntil?: string | null;
  techniques?: string[];
}

interface ReceiptBrowseLayoutProps {
  items: BrowseItem[];
  totalCount?: number;
  sortLabel?: string;
  filterLabel?: string;
  emptyMessage?: string;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatPriceDollars(dollars: number): string {
  return `$${dollars.toFixed(2)}`;
}

function getRemainingTime(endDateStr: string): string {
  const diff = new Date(endDateStr).getTime() - Date.now();
  if (diff <= 0) return 'ENDED';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}H ${m}M`;
}

function isUnavailable(item: BrowseItem): boolean {
  if (item.soldAt) return true;
  if (item.reservedUntil && new Date(item.reservedUntil) > new Date()) return true;
  return false;
}

export default function ReceiptBrowseLayout({
  items,
  totalCount,
  sortLabel = 'ENDING SOON',
  filterLabel = 'ALL',
  emptyMessage,
}: ReceiptBrowseLayoutProps) {
  const timestamp = formatReceiptTimestamp(new Date());
  const count = totalCount ?? items.length;

  if (items.length === 0) {
    return (
      <div
        className="font-mono text-[0.875rem] py-4"
        style={{ fontFamily: 'var(--font-display, "IBM Plex Mono", monospace)', color: 'var(--ink)' }}
      >
        <ReceiptDivider variant="major" />
        <div className="text-center py-3 uppercase font-bold">NO ITEMS FOUND</div>
        <ReceiptDivider variant="major" />
        <div className="text-center py-2 text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
          {emptyMessage ?? 'Check back soon. New pieces added regularly.'}
        </div>
        <ReceiptDivider variant="major" />
      </div>
    );
  }

  return (
    <div
      className="font-mono text-[0.875rem]"
      style={{ fontFamily: 'var(--font-display, "IBM Plex Mono", monospace)', color: 'var(--ink)' }}
    >
      {/* Filter/sort controls */}
      <div className="py-2 text-[0.6875rem] flex gap-6" style={{ color: 'var(--ink-muted)' }}>
        <span>FILTER BY: [{filterLabel}]</span>
        <span>SORT BY: [{sortLabel}]</span>
      </div>
      <div className="py-1 text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
        {timestamp}
      </div>
      <ReceiptDivider variant="major" />

      {items.map((item, i) => {
        const unavailable = isUnavailable(item);
        const price = item.listingType === 'buy_now'
          ? formatPriceDollars(item.buyNowPrice ?? 0)
          : formatPriceDollars(item.currentBid ?? item.startingBid ?? 0);

        return (
          <div key={item.id}>
            <div className="py-2" style={{ opacity: unavailable ? 0.5 : 1 }}>
              {/* SKU + title + price */}
              <div className="flex justify-between items-baseline gap-2">
                <div className="flex gap-2 min-w-0">
                  <span className="text-[0.6875rem] shrink-0" style={{ color: 'var(--ink-muted)' }}>
                    {item.sku}
                  </span>
                  <span className="uppercase font-semibold truncate">
                    {item.title}
                  </span>
                </div>
                <span className="receipt-price shrink-0 font-semibold">{price}</span>
              </div>

              {/* Techniques / descriptor */}
              {item.techniques && item.techniques.length > 0 && (
                <div className="pl-[4.5rem] text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
                  {item.techniques.slice(0, 2).join(', ')}
                </div>
              )}

              {/* Status + action */}
              <div className="pl-[4.5rem] flex gap-4 mt-1 items-baseline text-[0.6875rem]">
                {unavailable ? (
                  <span style={{ color: 'var(--ink-muted)' }}>SOLD</span>
                ) : item.listingType === 'auction' && item.endDate ? (
                  <span style={{ color: 'var(--error)' }}>
                    ENDS: {getRemainingTime(item.endDate)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--success)' }}>BUY NOW</span>
                )}
                {!unavailable && (
                  <Link
                    href={`/piece/${item.sku}`}
                    className="hover:underline"
                    style={{ color: 'var(--ink)' }}
                  >
                    [VIEW ITEM]
                  </Link>
                )}
              </div>
            </div>

            {i < items.length - 1 && <ReceiptDivider variant="minor" />}
          </div>
        );
      })}

      <ReceiptDivider variant="major" />
      <div className="py-1 text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
        SHOWING: {count} {count === 1 ? 'ITEM' : 'ITEMS'}
      </div>
      <ReceiptDivider variant="major" />
    </div>
  );
}
