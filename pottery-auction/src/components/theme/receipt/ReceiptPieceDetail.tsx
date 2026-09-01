'use client';

import Link from 'next/link';
import ReceiptPage from './ReceiptPage';
import ReceiptChrome from './ReceiptChrome';
import ReceiptFooterChrome from './ReceiptFooterChrome';
import ReceiptPhotoFrame from './ReceiptPhotoFrame';
import ReceiptDivider from './ReceiptDivider';
import { formatReceiptTimestamp } from '@/lib/format/receipt-timestamp';

// ─── Leader-dot spec row ──────────────────────────────────────────────────────

function SpecRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="receipt-line-item text-[0.75rem]"
      style={{ color: accent ? 'var(--ink)' : 'var(--ink-muted)' }}
    >
      <span className="uppercase whitespace-nowrap">{label}</span>
      <span className="leader" />
      <span style={{ color: 'var(--ink)', fontFamily: accent ? 'var(--font-thermal)' : undefined, fontSize: accent ? '1rem' : undefined }}>
        {value}
      </span>
    </div>
  );
}

// ─── Bid history row ──────────────────────────────────────────────────────────

interface BidRow {
  id: string;
  amount: number | null;
  status: string | null;
  created_at: Date | null;
  user_id: string | null;
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ItemShape {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  starting_bid: number | null;
  current_bid: number | null;
  buy_now_price: number | null;
  listing_type: string | null;
  sku: string | null;
  sold_at: Date | null;
  dimensions: unknown;
  techniques: string[];
  weight: number | null;
}

interface AuctionShape {
  id: string;
  status: string;
  end_date: Date | string | null;
  extended_end_date: Date | string | null;
  reserve_price: number | null;
}

interface Props {
  item: ItemShape;
  auction: AuctionShape | null;
  bids: BidRow[];
  sku: string;
  isSold: boolean;
  isReserved: boolean;
  isAuction: boolean;
  isBuyNow: boolean;
  auctionActive: boolean;
  reserveMet: boolean;
  today: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReceiptPieceDetail({
  item,
  auction,
  bids,
  sku,
  isSold,
  isReserved,
  isAuction,
  isBuyNow,
  auctionActive,
  reserveMet,
  today,
}: Props) {
  const title = item.title;

  // Dimensions display
  let dimStr = '—';
  if (item.dimensions && typeof item.dimensions === 'object' && !Array.isArray(item.dimensions)) {
    const d = item.dimensions as Record<string, unknown>;
    const parts = [
      d.height && `${d.height}" H`,
      d.width && `${d.width}" W`,
      d.depth && `${d.depth}" D`,
    ].filter(Boolean);
    if (parts.length) dimStr = parts.join(' × ');
  }

  // Status label
  let statusLabel = isAuction ? 'AUCTION' : 'BUY NOW';
  if (isSold) statusLabel = 'SOLD';
  else if (isReserved) statusLabel = 'RESERVED';
  else if (isAuction && auctionActive) statusLabel = 'BIDDING OPEN';
  else if (isAuction && !auctionActive) statusLabel = 'AUCTION ENDED';

  const headlinePrice = isAuction
    ? (item.current_bid ?? item.starting_bid)
    : item.buy_now_price;

  return (
    <ReceiptPage>
      <ReceiptChrome />

      {/* ── LOT RECORD bar ── */}
      <div className="receipt-section-bar" style={{ margin: '18px 0 4px' }}>
        <span>★ LOT RECORD ★</span>
        <span className="receipt-section-bar-count">{sku.toUpperCase()}</span>
      </div>
      <div
        className="flex flex-wrap justify-between"
        style={{ gap: '2px 12px', fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)', padding: '6px 0 12px' }}
      >
        <span>CERTIFICATE OF AUTHENTICITY · DATE: {today}</span>
        <span>STATUS: {statusLabel}</span>
      </div>

      {/* ── PHOTO ── */}
      <ReceiptPhotoFrame
        src={item.images?.[0]}
        alt={title}
        title={title}
        size="lg"
        stamp={
          isSold
            ? { label: 'SOLD', variant: 'red', rotate: -4 }
            : { label: 'AUTHENTIC', rotate: 4 }
        }
      />

      {/* Title + headline price */}
      <div className="receipt-line-item" style={{ marginTop: 12, gap: 8 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)', marginTop: 2 }}>
            {sku.toUpperCase()} · {(item.techniques ?? []).map((t) => t.toUpperCase()).join(' · ')}
          </div>
        </div>
        <span className="leader" />
        <div style={{ fontFamily: 'var(--font-thermal)', fontSize: 34, lineHeight: 1 }}>
          {formatPrice(headlinePrice)}
        </div>
      </div>

      {/* ── ITEM SPEC ROWS ── */}
      <div className="receipt-section-bar" style={{ margin: '22px 0 8px' }}>
        <span>ITEM SPECIFICATIONS</span>
      </div>
      <div className="space-y-1 py-1">
        <SpecRow label="SKU" value={sku.toUpperCase()} />
        <SpecRow label="TITLE" value={title.toUpperCase()} />
        {item.description && (
          <div
            className="text-[0.75rem] pt-1 pb-0.5 leading-snug"
            style={{ color: 'var(--ink-muted)' }}
          >
            {item.description}
          </div>
        )}
        {item.techniques?.length > 0 && (
          <SpecRow label="TECHNIQUE" value={item.techniques.join(' / ').toUpperCase()} />
        )}
        {dimStr !== '—' && <SpecRow label="DIMENSIONS" value={dimStr} />}
        {item.weight && <SpecRow label="WEIGHT" value={`${item.weight} OZ`} />}
        <SpecRow label="LISTING TYPE" value={isAuction ? 'AUCTION' : 'BUY NOW'} />
        <SpecRow
          label="STATUS"
          value={
            <span style={{ color: isSold ? 'var(--error)' : undefined }}>
              {statusLabel}
            </span>
          }
        />
      </div>

      {/* ── PRICING ── */}
      <div className="receipt-section-bar" style={{ margin: '22px 0 8px' }}>
        <span>{isAuction ? 'AUCTION PRICING' : 'PRICING'}</span>
      </div>
      <div className="space-y-1.5 py-1">
        {isAuction ? (
          <>
            <SpecRow
              label="STARTING BID"
              value={
                <span className="receipt-price" style={{ fontFamily: 'var(--font-thermal)', fontSize: '1.2rem' }}>
                  {formatPrice(item.starting_bid)}
                </span>
              }
            />
            <SpecRow
              label="CURRENT BID"
              value={
                <span className="receipt-price" style={{ fontFamily: 'var(--font-thermal)', fontSize: '1.35rem' }}>
                  {item.current_bid ? formatPrice(item.current_bid) : 'NO BIDS YET'}
                </span>
              }
            />
            <SpecRow label="BIDS PLACED" value={String(bids?.length ?? 0)} />
            {auction && (
              <SpecRow
                label="AUCTION STATUS"
                value={auctionActive ? 'LIVE — BIDDING OPEN' : 'ENDED'}
              />
            )}
          </>
        ) : (
          <SpecRow
            label="BUY NOW PRICE"
            value={
              <span className="receipt-price" style={{ fontFamily: 'var(--font-thermal)', fontSize: '1.35rem' }}>
                {formatPrice(item.buy_now_price)}
              </span>
            }
          />
        )}
      </div>

      {/* Reserve not met warning */}
      {isAuction && !reserveMet && auctionActive && (
        <div
          className="py-2 text-[0.75rem]"
          style={{
            color: 'var(--error)',
            border: '1.5px dashed var(--error)',
            padding: '8px 12px',
            marginTop: 10,
          }}
        >
          RESERVE NOT MET — CURRENT BID IS BELOW THE MINIMUM SALE PRICE.
        </div>
      )}

      {/* ── ACTION BUTTONS ── */}
      <div className="flex flex-col items-center" style={{ gap: 12, padding: '20px 0 6px' }}>
        {isAuction && auctionActive && !isSold && (
          <Link href="/auctions" className="receipt-action-btn">
            PLACE BID
          </Link>
        )}

        {isBuyNow && !isSold && !isReserved && (
          <Link href={`/checkout?sku=${sku}`} className="receipt-action-btn">
            BUY NOW
          </Link>
        )}

        {isSold && (
          <div
            className="receipt-stamp-badge receipt-stamp-badge--red"
            style={{ fontSize: 15, transform: 'rotate(-2deg)' }}
          >
            ✕ ITEM SOLD ✕
          </div>
        )}

        {isReserved && !isSold && (
          <div className="text-[0.75rem] uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
            TEMPORARILY RESERVED — CHECK BACK SOON
          </div>
        )}

        <Link href="/browse" className="receipt-view-item-link">
          ← BROWSE MORE
        </Link>
      </div>

      {/* ── BID HISTORY ── */}
      {isAuction && bids && bids.length > 0 && (
        <>
          <div className="receipt-section-bar" style={{ margin: '16px 0 8px' }}>
            <span>BID HISTORY</span>
            <span className="receipt-section-bar-count">
              {bids.length} {bids.length === 1 ? 'BID' : 'BIDS'}
            </span>
          </div>
          <div className="space-y-0.5 py-1">
            {bids.map((bid, i) => {
              const isTopBid = i === 0;
              return (
                <div
                  key={bid.id}
                  className="receipt-line-item text-[0.6875rem]"
                  style={{ color: 'var(--ink-muted)' }}
                >
                  <span>{bid.created_at ? formatReceiptTimestamp(bid.created_at) : '—'}</span>
                  <span className="leader" />
                  <span
                    className="receipt-price"
                    style={{
                      fontFamily: 'var(--font-thermal)',
                      fontSize: '1rem',
                      color: isTopBid ? 'var(--ink)' : undefined,
                    }}
                  >
                    {formatPrice(bid.amount)}
                  </span>
                  &nbsp;
                  <span
                    style={{
                      fontSize: '0.5rem',
                      letterSpacing: '0.1em',
                      color: isTopBid ? 'var(--accent)' : 'var(--ink-muted)',
                    }}
                  >
                    {isTopBid ? '[TOP]' : '[OUTBID]'}
                  </span>
                </div>
              );
            })}
          </div>
          <ReceiptDivider variant="minor" />
        </>
      )}

      <ReceiptFooterChrome barcodeSeed={sku} />
    </ReceiptPage>
  );
}
