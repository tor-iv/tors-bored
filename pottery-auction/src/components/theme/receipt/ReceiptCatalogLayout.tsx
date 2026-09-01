'use client';

import Link from 'next/link';
import ReceiptPage from './ReceiptPage';
import ReceiptChrome from './ReceiptChrome';
import ReceiptFooterChrome from './ReceiptFooterChrome';
import ReceiptPhotoFrame from './ReceiptPhotoFrame';

// ─── Item shape (snake_case — matches drizzle row) ────────────────────────────

export interface CatalogItem {
  id: string;
  sku: string;
  title: string;
  listing_type: 'auction' | 'buy_now';
  buy_now_price?: number | null;
  current_bid?: number | null;
  starting_bid?: number | null;
  end_date?: string | null;
  sold_at?: string | null;
  reserved_until?: string | null;
  techniques?: string[];
  images?: string[];
}

export interface ReceiptCatalogLayoutProps {
  items: CatalogItem[];
  mode: 'browse' | 'shop';
  /** Barcode seed for the footer */
  catalogCode: string;
  /** e.g. "INVENTORY LIST" or "BUY-NOW COUNTER" */
  catalogTitle: string;
  emptyMessage?: string;
  /** Kept for caller compatibility — chrome renders its own live clock now. */
  dateStr?: string;
  /** Kept for caller compatibility — the circular received stamp was retired. */
  receivedLabel?: string;
}

// ─── Single catalog row ───────────────────────────────────────────────────────

function EntryRow({ item, mode }: { item: CatalogItem; mode: 'browse' | 'shop' }) {
  const isSold = !!item.sold_at;
  const isReserved = !!(item.reserved_until && new Date(item.reserved_until) > new Date());
  const unavailable = isSold || isReserved;

  const displayPrice =
    mode === 'shop'
      ? (item.buy_now_price ?? 0)
      : (item.current_bid ?? item.starting_bid ?? item.buy_now_price ?? 0);

  const priceLabel =
    item.listing_type === 'buy_now'
      ? 'BUY NOW'
      : item.current_bid
        ? 'CURRENT BID'
        : 'STARTING BID';

  const href = mode === 'shop' ? `/checkout?sku=${item.sku}` : `/piece/${item.sku}`;

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: '86px 1fr',
        gap: 14,
        padding: '14px 0',
        borderBottom: '1px dashed var(--border)',
        opacity: unavailable ? 0.55 : 1,
      }}
    >
      <ReceiptPhotoFrame
        src={item.images?.[0]}
        alt={item.title}
        title={item.title}
        size="sm"
        stamp={unavailable ? { label: isSold ? 'SOLD' : 'RESERVED', variant: 'red', rotate: -4 } : undefined}
      />
      <div className="flex min-w-0 flex-col" style={{ gap: 3 }}>
        <div className="receipt-line-item" style={{ gap: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{item.title}</span>
          <span className="leader" />
          <span style={{ fontFamily: 'var(--font-thermal)', fontSize: 26, lineHeight: 1 }}>
            ${displayPrice.toFixed(2)}
          </span>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)' }}>
          {item.sku} · {(item.techniques ?? []).map((t) => t.toUpperCase()).join(' · ')}
        </div>
        <div className="flex items-baseline justify-between" style={{ marginTop: 'auto' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: unavailable ? 'var(--ink-muted)' : 'var(--accent)' }}>
            {unavailable ? (isSold ? 'SOLD' : 'RESERVED') : priceLabel}
          </span>
          {unavailable ? (
            <span style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)' }}>UNAVAILABLE</span>
          ) : (
            <Link href={href} className="receipt-view-item-link">
              {mode === 'shop' ? 'BUY NOW →' : 'VIEW ITEM →'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function ReceiptCatalogLayout({
  items,
  mode,
  catalogCode,
  catalogTitle,
  emptyMessage,
}: ReceiptCatalogLayoutProps) {
  return (
    <ReceiptPage>
      <ReceiptChrome />

      <div className="receipt-section-bar" style={{ margin: '18px 0 4px' }}>
        <span>{catalogTitle}</span>
        <span className="receipt-section-bar-count">QTY {items.length}</span>
      </div>
      <div
        className="flex justify-between"
        style={{ fontSize: 10, letterSpacing: 1, color: 'var(--ink-muted)', padding: '6px 0 2px' }}
      >
        <span>FILTER: {mode === 'shop' ? '[BUY NOW]' : '[ALL]'}</span>
        <span>SORT: [NEWEST]</span>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center" style={{ lineHeight: 1.8 }}>
          <div className="receipt-stamp-badge" style={{ fontSize: 14, transform: 'rotate(-2deg)' }}>
            NO ITEMS ON FILE
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 12 }}>
            {(emptyMessage ?? 'CHECK BACK SOON. NEW PIECES ADDED REGULARLY.').toUpperCase()}
          </div>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <EntryRow key={item.id} item={item} mode={mode} />
          ))}
          <div
            className="text-center"
            style={{ fontSize: 10, letterSpacing: 2, color: 'var(--ink-muted)', padding: '12px 0 0' }}
          >
            SHOWING: {items.length} ITEM{items.length === 1 ? '' : 'S'}
          </div>
        </>
      )}

      <ReceiptFooterChrome barcodeSeed={catalogCode} />
    </ReceiptPage>
  );
}
