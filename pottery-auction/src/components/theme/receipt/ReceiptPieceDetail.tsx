'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Barcode from './Barcode';
import ReceiptDivider from './ReceiptDivider';
import { formatReceiptTimestamp } from '@/lib/format/receipt-timestamp';

// ─── Vessel silhouettes — same shapes as auctions/page.tsx ───────────────────

const VESSELS: React.ReactNode[] = [
  <path key="vase" d="M40 18 q-3 8 2 14 q-14 8 -14 30 q0 22 22 22 q22 0 22 -22 q0 -22 -14 -30 q5 -6 2 -14 z" />,
  <path key="bowl" d="M22 46 q28 30 56 0 q-2 -4 -8 -4 l-40 0 q-6 0 -8 4 z" />,
  <g key="mug">
    <path d="M30 34 l36 0 l-3 44 l-30 0 z" />
    <path d="M66 44 q16 2 14 16 q-2 12 -14 12" fill="none" />
  </g>,
  <path key="jug" d="M38 22 l16 0 l3 10 q10 6 10 24 q0 22 -21 22 q-21 0 -21 -22 q0 -16 10 -24 z" />,
];

function vesselFor(title: string): React.ReactNode {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return VESSELS[h % VESSELS.length];
}

// ─── Empty polaroid placeholder ───────────────────────────────────────────────

function EmptyPolaroid({ title, isSold }: { title: string; isSold: boolean }) {
  return (
    <div className="receipt-polaroid" style={{ maxWidth: 220, margin: '0 auto' }}>
      <div className="receipt-polaroid-frame" style={{ position: 'relative' }}>
        <div
          style={{
            width: '100%',
            aspectRatio: '4/3',
            backgroundColor: 'var(--paper-highlight, rgba(255,255,255,0.12))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            width="62%"
            height="62%"
            fill="var(--ink)"
            stroke="var(--ink)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            style={{ opacity: 0.5, transform: 'rotate(-1.5deg)' }}
            aria-hidden
          >
            <g fillOpacity={0.06}>{vesselFor(title)}</g>
          </svg>
          <span
            className="receipt-stamp"
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              fontFamily: 'var(--font-stamp)',
              fontSize: '0.5rem',
              letterSpacing: '0.15em',
              color: 'var(--ink-muted)',
              opacity: 0.6,
              transform: 'rotate(-4deg)',
            }}
          >
            STUDIO PROOF
          </span>
          {isSold && <SoldStamp />}
        </div>
      </div>
      <div className="receipt-polaroid-caption" style={{ fontFamily: 'var(--font-stamp)', fontSize: '0.85rem' }}>
        {title}
      </div>
    </div>
  );
}

// ─── SOLD rubber stamp overlay ────────────────────────────────────────────────

function SoldStamp() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.5, rotate: -20 }}
      animate={{ opacity: 0.92, scale: 1, rotate: -15 }}
      transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.45 }}
      aria-label="SOLD"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-stamp)',
          color: 'var(--error)',
          border: '3px solid var(--error)',
          borderRadius: 4,
          padding: '4px 18px 3px',
          fontSize: '1.9rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          lineHeight: 1.1,
          textAlign: 'center',
          mixBlendMode: 'multiply',
          textShadow: '0 0 2px var(--error), 0.5px 0.4px 0 rgba(176,57,44,0.2)',
          boxShadow: 'inset 0 0 0 1.5px rgba(176,57,44,0.12)',
          transform: 'rotate(-15deg)',
        }}
      >
        SOLD
      </div>
    </motion.div>
  );
}

// ─── Real photo polaroid ──────────────────────────────────────────────────────

function PhotoPolaroid({
  src,
  alt,
  title,
  sku,
  isSold,
}: {
  src: string;
  alt: string;
  title: string;
  sku: string;
  isSold: boolean;
}) {
  const tiltDeg = ([...sku].reduce((a, c) => a + c.charCodeAt(0), 0) % 7) - 3;

  return (
    <div className="receipt-polaroid" style={{ maxWidth: 260, margin: '0 auto' }}>
      <div
        className="receipt-polaroid-frame"
        style={{
          transform: `rotate(${tiltDeg}deg)`,
          position: 'relative',
        }}
      >
        {/* Tape strips */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 28,
            height: 9,
            backgroundColor: 'rgba(255,235,150,0.55)',
            top: -5,
            left: 14,
            transform: 'rotate(-6deg)',
            zIndex: 2,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 28,
            height: 9,
            backgroundColor: 'rgba(255,235,150,0.55)',
            top: -5,
            right: 14,
            transform: 'rotate(6deg)',
            zIndex: 2,
          }}
        />
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
          <Image
            src={src}
            alt={alt}
            fill
            style={{
              objectFit: 'cover',
              filter: 'sepia(0.18) saturate(0.88) contrast(1.05) brightness(0.98)',
            }}
            sizes="(max-width: 560px) 100vw, 560px"
          />
          {isSold && <SoldStamp />}
        </div>
      </div>
      <div style={{ transform: `rotate(${tiltDeg}deg)` }}>
        <div className="receipt-polaroid-caption">
          <div style={{ fontFamily: 'var(--font-stamp)', fontSize: '0.85rem' }}>{title}</div>
          <div className="receipt-polaroid-sku">SKU: {sku}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Leader-dot spec row ──────────────────────────────────────────────────────

function SpecRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="receipt-line-item text-[0.75rem]"
      style={{ fontFamily: 'var(--font-display)', color: accent ? 'var(--ink)' : 'var(--ink-muted)' }}
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
  const hasImage = item.images?.length > 0;
  const title = item.title;

  const txCode = `LOT-${sku.slice(0, 10).toUpperCase()}`;

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

  return (
    <div style={{ backgroundColor: 'var(--bg-well)', minHeight: '100vh', padding: '32px 16px 80px' }}>

      {/* The receipt paper strip */}
      <div className="receipt-strip-paper" style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>

        {/* ── Animated accent stamps ── */}

        {/* Blue circular "RECEIVED" date stamp */}
        <motion.div
          initial={{ opacity: 0, scale: 1.2, rotate: 14 }}
          animate={{ opacity: 0.52, scale: 1, rotate: 8 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.7 }}
          aria-hidden
          className="receipt-date-stamp"
          style={{ position: 'absolute', top: 58, left: 14, zIndex: 3, pointerEvents: 'none' }}
        >
          <div style={{ fontSize: '0.38rem', letterSpacing: '0.1em', lineHeight: 1.4 }}>
            <div>RECEIVED</div>
            <div style={{ fontSize: '0.52rem', letterSpacing: '0.06em', fontWeight: 'bold' }}>JUN 2026</div>
            <div>STUDIO</div>
          </div>
        </motion.div>

        {/* Red "AUTHENTIC" or "SOLD" accent stamp — top-right */}
        <motion.div
          initial={{ opacity: 0, scale: 1.4, rotate: -18 }}
          animate={{ opacity: 0.88, scale: 1, rotate: -13 }}
          transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.3 }}
          aria-hidden
          style={{
            position: 'absolute',
            top: 62,
            right: 16,
            zIndex: 3,
            fontFamily: 'var(--font-stamp)',
            color: isSold ? 'var(--error)' : 'var(--stamp-blue, #335a7a)',
            border: `2.5px solid ${isSold ? 'var(--error)' : 'var(--stamp-blue, #335a7a)'}`,
            borderRadius: 3,
            padding: '3px 12px 2px',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            lineHeight: 1.1,
            textAlign: 'center',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        >
          {isSold ? 'SOLD' : 'AUTHENTIC'}
          <div style={{ fontSize: '0.4rem', letterSpacing: '0.2em', marginTop: 2 }}>
            {isSold ? '● ITEM UNAVAILABLE ●' : '● HANDMADE ●'}
          </div>
        </motion.div>

        <div className="receipt-edge-top" />
        <div className="receipt-strip-content py-6">

          {/* ── HEADER ── */}
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

            <ReceiptDivider variant="decorative" />

            <div
              className="receipt-stamp text-[1.25rem] uppercase tracking-wide py-1"
              style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
            >
              ★ LOT RECORD ★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              CERTIFICATE OF AUTHENTICITY
            </div>

            <ReceiptDivider variant="decorative" />

            <div className="pt-1" style={{ lineHeight: 1.6 }}>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                {txCode} &nbsp;·&nbsp; DATE: {today}
              </div>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                ITEM: {sku.toUpperCase()} &nbsp;·&nbsp; REG #04
              </div>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                TYPE: {isAuction ? 'AUCTION' : 'BUY NOW'} &nbsp;·&nbsp; STATUS: {statusLabel}
              </div>
            </div>
          </div>

          <ReceiptDivider variant="major" />

          {/* ── POLAROID ── */}
          <div className="py-5">
            {hasImage ? (
              <PhotoPolaroid
                src={item.images[0]}
                alt={title}
                title={title}
                sku={sku}
                isSold={isSold}
              />
            ) : (
              <EmptyPolaroid title={title} isSold={isSold} />
            )}
          </div>

          <ReceiptDivider variant="major" />

          {/* ── ITEM SPEC ROWS ── */}
          <div
            className="text-[0.625rem] uppercase tracking-widest pb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            ITEM SPECIFICATIONS
          </div>
          <ReceiptDivider variant="minor" />
          <div className="space-y-1 py-2">
            <SpecRow label="SKU" value={sku.toUpperCase()} />
            <SpecRow label="TITLE" value={title.toUpperCase()} />
            {item.description && (
              <div
                className="text-[0.75rem] pt-1 pb-0.5 leading-snug"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
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

          <ReceiptDivider variant="major" />

          {/* ── PRICING ── */}
          <div
            className="text-[0.625rem] uppercase tracking-widest pb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            {isAuction ? 'AUCTION PRICING' : 'PRICING'}
          </div>
          <ReceiptDivider variant="minor" />
          <div className="space-y-1.5 py-2">
            {isAuction ? (
              <>
                <SpecRow
                  label="STARTING BID"
                  value={
                    <span
                      className="receipt-price"
                      style={{ fontFamily: 'var(--font-thermal)', fontSize: '1rem' }}
                    >
                      {formatPrice(item.starting_bid)}
                    </span>
                  }
                />
                <SpecRow
                  label="CURRENT BID"
                  value={
                    <span
                      className="receipt-price font-bold"
                      style={{ fontFamily: 'var(--font-thermal)', fontSize: '1.1rem' }}
                    >
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
                  <span
                    className="receipt-price font-bold"
                    style={{ fontFamily: 'var(--font-thermal)', fontSize: '1.1rem' }}
                  >
                    {formatPrice(item.buy_now_price)}
                  </span>
                }
              />
            )}
          </div>

          {/* Reserve not met warning */}
          {isAuction && !reserveMet && auctionActive && (
            <>
              <ReceiptDivider variant="minor" />
              <div
                className="py-2 text-[0.75rem]"
                style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}
              >
                ┌──────────────────────────────┐<br />
                │&nbsp;&nbsp;RESERVE NOT MET&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
                │&nbsp;&nbsp;Current bid is below the&nbsp;&nbsp;&nbsp;&nbsp;│<br />
                │&nbsp;&nbsp;minimum sale price.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
                └──────────────────────────────┘
              </div>
            </>
          )}

          <ReceiptDivider variant="major" />

          {/* ── ACTION BUTTON ── */}
          <div className="py-4 flex flex-col items-center gap-3">
            {isAuction && auctionActive && !isSold && (
              <Link href="/auctions">
                <button
                  className="receipt-stamp uppercase tracking-widest px-8 py-2.5 text-[0.9rem] border border-current"
                  style={{
                    fontFamily: 'var(--font-stamp)',
                    color: 'var(--ink)',
                    transform: 'rotate(-0.5deg)',
                    boxShadow: '3px 3px 0 var(--ink)',
                    transition: 'box-shadow 0.1s, transform 0.1s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '1px 1px 0 var(--ink)';
                    e.currentTarget.style.transform = 'rotate(-0.5deg) translate(2px, 2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '3px 3px 0 var(--ink)';
                    e.currentTarget.style.transform = 'rotate(-0.5deg)';
                  }}
                >
                  [ PLACE BID ]
                </button>
              </Link>
            )}

            {isBuyNow && !isSold && !isReserved && (
              <Link href={`/checkout?sku=${sku}`}>
                <button
                  className="receipt-stamp uppercase tracking-widest px-8 py-2.5 text-[0.9rem] border border-current"
                  style={{
                    fontFamily: 'var(--font-stamp)',
                    color: 'var(--ink)',
                    transform: 'rotate(-0.5deg)',
                    boxShadow: '3px 3px 0 var(--ink)',
                    transition: 'box-shadow 0.1s, transform 0.1s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '1px 1px 0 var(--ink)';
                    e.currentTarget.style.transform = 'rotate(-0.5deg) translate(2px, 2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '3px 3px 0 var(--ink)';
                    e.currentTarget.style.transform = 'rotate(-0.5deg)';
                  }}
                >
                  [ BUY NOW ]
                </button>
              </Link>
            )}

            {isSold && (
              <div
                className="receipt-stamp text-[1.1rem] uppercase tracking-widest py-2 px-8 border border-current"
                style={{
                  fontFamily: 'var(--font-stamp)',
                  color: 'var(--error)',
                  borderColor: 'var(--error)',
                  transform: 'rotate(-1deg)',
                }}
              >
                ✕ ITEM SOLD ✕
              </div>
            )}

            {isReserved && !isSold && (
              <div
                className="text-[0.75rem] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                TEMPORARILY RESERVED — CHECK BACK SOON
              </div>
            )}

            <Link href="/browse">
              <span
                className="text-[0.75rem] uppercase tracking-widest"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--ink-muted)',
                  cursor: 'pointer',
                  borderBottom: '1px dotted var(--ink-muted)',
                }}
              >
                {'< BROWSE MORE >'}
              </span>
            </Link>
          </div>

          <ReceiptDivider variant="major" />

          {/* ── BID HISTORY ── */}
          {isAuction && bids && bids.length > 0 && (
            <>
              <div
                className="text-[0.625rem] uppercase tracking-widest pb-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                BID HISTORY — {sku.toUpperCase()}
              </div>
              <ReceiptDivider variant="minor" />
              <div className="space-y-0.5 py-2">
                {bids.map((bid, i) => {
                  const isTopBid = i === 0;
                  return (
                    <div
                      key={bid.id}
                      className="receipt-line-item text-[0.6875rem]"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
                    >
                      <span>{bid.created_at ? formatReceiptTimestamp(bid.created_at) : '—'}</span>
                      <span className="leader" />
                      <span
                        className="receipt-price"
                        style={{
                          fontFamily: 'var(--font-thermal)',
                          fontSize: '0.9rem',
                          color: isTopBid ? 'var(--ink)' : undefined,
                          fontWeight: isTopBid ? 700 : 400,
                        }}
                      >
                        {formatPrice(bid.amount)}
                      </span>
                      &nbsp;
                      <span
                        style={{
                          fontSize: '0.5rem',
                          letterSpacing: '0.1em',
                          color: isTopBid ? 'var(--ink)' : 'var(--ink-muted)',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {isTopBid ? '[TOP]' : '[OUTBID]'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <ReceiptDivider variant="minor" />
              <div
                className="text-[0.6875rem] uppercase py-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                {bids.length} {bids.length === 1 ? 'BID' : 'BIDS'} PLACED
              </div>
              <ReceiptDivider variant="major" />
            </>
          )}

          {/* ── FOOTER ── */}
          <div className="pt-2 pb-4 text-center" style={{ lineHeight: 1.5 }}>
            <div className="receipt-tear" />

            {/* Summary rows */}
            <div className="text-left px-2 mb-3" style={{ lineHeight: 1.7 }}>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">BUYER&apos;S PREMIUM</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>0%</span>
              </div>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">ARTIST</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>TOR</span>
              </div>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">STUDIO</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>BROOKLYN, NY</span>
              </div>
            </div>

            <ReceiptDivider variant="minor" />

            <Barcode seed={sku} className="mx-auto mt-2" />

            <ReceiptDivider variant="minor" />

            {/* CERTIFICATE OF AUTHENTICITY stamp */}
            <motion.div
              initial={{ opacity: 0, scale: 1.2, rotate: 2 }}
              animate={{ opacity: 0.85, scale: 1, rotate: -1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 1.0 }}
              className="receipt-stamp text-[0.75rem] uppercase tracking-widest py-1 px-3 mx-auto"
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-stamp)',
                color: 'var(--stamp-blue, #335a7a)',
                border: '1.5px solid var(--stamp-blue, #335a7a)',
                borderRadius: 3,
                marginTop: 8,
                marginBottom: 8,
                mixBlendMode: 'multiply',
              }}
            >
              CERTIFICATE OF AUTHENTICITY
              <div style={{ fontSize: '0.45rem', letterSpacing: '0.18em', marginTop: 2 }}>
                ★ HANDMADE · ONE OF A KIND ★
              </div>
            </motion.div>

            <ReceiptDivider variant="decorative" />

            <div
              className="receipt-stamp text-[1rem] uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
            >
              ★ THANK YOU ★
            </div>
            <div
              className="text-[0.6875rem] uppercase mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ALL SALES FINAL · NO REFUNDS
            </div>
            <div
              className="text-[0.6875rem] uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              HANDMADE WITH LOVE IN BROOKLYN
            </div>

            <ReceiptDivider variant="decorative" />

            <div
              className="text-[0.5rem] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★★★★★ POTTERY ★★★★★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-widest mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              TOR&apos;S BORED POTTERY CO. · {txCode} · {today}
            </div>
          </div>

        </div>
        <div className="receipt-edge-bottom" />
      </div>
    </div>
  );
}
