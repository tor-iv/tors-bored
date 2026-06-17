'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ReceiptDivider from './ReceiptDivider';
import Barcode from './Barcode';
import { staggerContainer, clayForm, shelfLift } from '@/lib/animation-variants';

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
  /** Printed on the header block */
  catalogCode: string;
  /** e.g. "INVENTORY LIST" or "BUY-NOW COUNTER" */
  catalogTitle: string;
  emptyMessage?: string;
  /** Pre-computed on the server to avoid hydration mismatch (e.g. "06/15/26") */
  dateStr: string;
  /** Pre-computed on the server to avoid hydration mismatch (e.g. "JUN 2026") */
  receivedLabel: string;
}

// ─── Empty polaroid placeholder ───────────────────────────────────────────────
// Four hand-drawn vessel silhouettes chosen deterministically from the title.

const VESSELS: React.ReactNode[] = [
  // Bulbous flower vase
  <path key="vase" d="M40 18 q-3 8 2 14 q-14 8 -14 30 q0 22 22 22 q22 0 22 -22 q0 -22 -14 -30 q5 -6 2 -14 z" />,
  // Wide bowl
  <path key="bowl" d="M22 46 q28 30 56 0 q-2 -4 -8 -4 l-40 0 q-6 0 -8 4 z" />,
  // Mug with handle
  <g key="mug">
    <path d="M30 34 l36 0 l-3 44 l-30 0 z" />
    <path d="M66 44 q16 2 14 16 q-2 12 -14 12" fill="none" />
  </g>,
  // Tall jug with spout
  <path key="jug" d="M38 22 l16 0 l3 10 q10 6 10 24 q0 22 -21 22 q-21 0 -21 -22 q0 -16 10 -24 z" />,
];

function vesselFor(title: string): React.ReactNode {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return VESSELS[h % VESSELS.length];
}

function EmptyPolaroid({ title }: { title: string }) {
  return (
    <div className="receipt-polaroid-frame" style={{ maxWidth: 200, margin: '0 auto' }}>
      <div
        style={{
          width: '100%',
          aspectRatio: '1/1',
          backgroundColor: 'var(--paper-highlight)',
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
      </div>
      <div className="receipt-polaroid-caption">{title}</div>
    </div>
  );
}

// ─── Single catalog entry card ────────────────────────────────────────────────

interface EntryCardProps {
  item: CatalogItem;
  index: number;
  mode: 'browse' | 'shop';
}

function EntryCard({ item, index, mode }: EntryCardProps) {
  const hasImage = !!(item.images && item.images.length > 0);
  const tilt = index % 2 === 0 ? 'rotate(-1.2deg)' : 'rotate(0.8deg)';

  const isSold = !!item.sold_at;
  const isReserved = !!(item.reserved_until && new Date(item.reserved_until) > new Date());
  const unavailable = isSold || isReserved;

  const displayPrice =
    mode === 'shop'
      ? (item.buy_now_price ?? 0)
      : (item.current_bid ?? item.starting_bid ?? 0);

  const href =
    mode === 'shop'
      ? `/checkout?sku=${item.sku}`
      : `/piece/${item.sku}`;

  const buttonLabel = mode === 'shop' ? '[ BUY NOW ]' : '[ VIEW ]';

  return (
    <motion.div
      variants={clayForm}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      style={{ opacity: unavailable ? 0.55 : 1 }}
    >
      <motion.div
        variants={shelfLift}
        initial="rest"
        whileHover="hover"
        className="receipt-polaroid"
        style={{ transform: tilt }}
      >
        {/* Polaroid photo / placeholder */}
        {hasImage ? (
          <div className="receipt-polaroid-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.images![0]}
              alt={item.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div className="receipt-polaroid-caption" style={{ fontFamily: 'var(--font-caption)' }}>
              {item.title}
            </div>
          </div>
        ) : (
          <EmptyPolaroid title={item.title} />
        )}

        {/* SKU */}
        {item.sku && (
          <div className="receipt-polaroid-sku text-center mt-2">
            SKU: {item.sku}
          </div>
        )}

        {/* Line items */}
        <div className="space-y-1 mt-3 px-1">
          <ReceiptDivider variant="minor" />

          {mode === 'browse' && item.listing_type === 'auction' && (
            <>
              <div
                className="receipt-line-item text-[0.75rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">STARTING BID</span>
                <span className="leader" />
                <span className="receipt-price" style={{ color: 'var(--ink)' }}>
                  ${(item.starting_bid ?? 0).toFixed(2)}
                </span>
              </div>

              <div
                className="receipt-line-item text-[0.75rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">CURRENT BID</span>
                <span className="leader" />
                {item.current_bid ? (
                  <span className="receipt-price font-bold" style={{ color: 'var(--ink)' }}>
                    ${item.current_bid.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-[0.625rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
                    NO BIDS YET
                  </span>
                )}
              </div>
            </>
          )}

          {mode === 'shop' && (
            <div
              className="receipt-line-item text-[0.75rem]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">PRICE</span>
              <span className="leader" />
              <span className="receipt-price font-bold" style={{ color: 'var(--ink)' }}>
                ${displayPrice.toFixed(2)}
              </span>
            </div>
          )}

          {mode === 'browse' && item.listing_type === 'buy_now' && item.buy_now_price != null && (
            <div
              className="receipt-line-item text-[0.75rem]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">BUY NOW</span>
              <span className="leader" />
              <span className="receipt-price font-bold" style={{ color: 'var(--ink)' }}>
                ${item.buy_now_price.toFixed(2)}
              </span>
            </div>
          )}

          {item.techniques && item.techniques.length > 0 && (
            <div
              className="text-[0.5rem] uppercase tracking-wider mt-1"
              style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
            >
              TECH: {item.techniques.join(' / ').toUpperCase()}
            </div>
          )}

          {unavailable && (
            <div
              className="text-[0.6875rem] uppercase font-bold tracking-widest mt-1"
              style={{ color: 'var(--error)', fontFamily: 'var(--font-stamp)' }}
            >
              *** {isSold ? 'SOLD' : 'RESERVED'} ***
            </div>
          )}

          <ReceiptDivider variant="minor" />
        </div>

        {/* Action button */}
        <div className="mt-3 px-1 pb-1 flex justify-center">
          {unavailable ? (
            <span
              className="receipt-stamp uppercase tracking-widest px-6 py-2 text-[0.875rem] border border-current"
              style={{
                fontFamily: 'var(--font-stamp)',
                color: 'var(--ink-muted)',
                transform: 'rotate(-0.5deg)',
                boxShadow: '3px 3px 0 var(--ink-muted)',
                opacity: 0.5,
                cursor: 'default',
              }}
            >
              [ UNAVAILABLE ]
            </span>
          ) : (
            <Link
              href={href}
              className="receipt-stamp uppercase tracking-widest px-6 py-2 text-[0.875rem] border border-current"
              style={{
                fontFamily: 'var(--font-stamp)',
                color: 'var(--ink)',
                transform: 'rotate(-0.5deg)',
                boxShadow: '3px 3px 0 var(--ink)',
                transition: 'box-shadow 0.1s, transform 0.1s',
                display: 'inline-block',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.boxShadow = '1px 1px 0 var(--ink)';
                el.style.transform = 'rotate(-0.5deg) translate(2px, 2px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.boxShadow = '3px 3px 0 var(--ink)';
                el.style.transform = 'rotate(-0.5deg)';
              }}
            >
              {buttonLabel}
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function ReceiptCatalogLayout({
  items,
  mode,
  catalogCode,
  catalogTitle,
  emptyMessage,
  dateStr,
  receivedLabel,
}: ReceiptCatalogLayoutProps) {
  const today = dateStr;
  const txCode = `TXN-${catalogCode.slice(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;

  return (
    <div style={{ backgroundColor: 'var(--bg-well)', minHeight: '100vh', padding: '32px 16px 80px' }}>
      <div
        className="receipt-strip-paper"
        style={{ maxWidth: 520, margin: '0 auto' }}
      >
        {/* Blue circular received stamp */}
        <motion.div
          initial={{ opacity: 0, scale: 1.2, rotate: 14 }}
          animate={{ opacity: 0.52, scale: 1, rotate: 8 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.8 }}
          aria-hidden
          className="receipt-date-stamp"
          style={{
            position: 'absolute',
            top: 58,
            left: 14,
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '0.38rem', letterSpacing: '0.1em', lineHeight: 1.4 }}>
            <div>RECEIVED</div>
            <div style={{ fontSize: '0.52rem', letterSpacing: '0.06em', fontWeight: 'bold' }}>
              {receivedLabel}
            </div>
            <div>STUDIO</div>
          </div>
        </motion.div>

        {/* Red stamp accent — mode-specific */}
        <motion.div
          initial={{ opacity: 0, scale: 1.4, rotate: -18 }}
          animate={{ opacity: 0.85, scale: 1, rotate: -13 }}
          transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.35 }}
          aria-hidden
          style={{
            position: 'absolute',
            top: 62,
            right: 16,
            zIndex: 3,
            fontFamily: 'var(--font-stamp)',
            color: mode === 'shop' ? 'var(--stamp-blue)' : 'var(--error)',
            border: `2.5px solid ${mode === 'shop' ? 'var(--stamp-blue)' : 'var(--error)'}`,
            borderRadius: 3,
            padding: '3px 12px 2px',
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            lineHeight: 1.1,
            textAlign: 'center',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
            textShadow: '0 0 1px currentColor, 0.5px 0.4px 0 rgba(0,0,0,0.1)',
            boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,0.08)',
          }}
        >
          {mode === 'shop' ? 'SHOP' : 'CATALOG'}
          <div style={{ fontSize: '0.42rem', letterSpacing: '0.22em', marginTop: 2 }}>
            {mode === 'shop' ? '● BUY NOW ●' : '● ALL ITEMS ●'}
          </div>
        </motion.div>

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
              CASHIER: TOR &nbsp;·&nbsp; REG #04 &nbsp;·&nbsp; STUDIO DIRECT
            </div>

            <ReceiptDivider variant="decorative" />

            <div
              className="receipt-stamp text-[1.25rem] uppercase tracking-wide py-1"
              style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
            >
              ★★★ {catalogTitle} ★★★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★★★★★ POTTERY ★★★★★
            </div>

            <ReceiptDivider variant="decorative" />

            <div className="pt-2" style={{ lineHeight: 1.6 }}>
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
                TERMINAL: POS-04 &nbsp;·&nbsp; MEMBER: STUDIO
              </div>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                ITEMS: {items.length} &nbsp;·&nbsp; FILTER:{' '}
                {mode === 'shop' ? 'BUY NOW ONLY' : 'ALL LISTINGS'}
              </div>
            </div>
          </div>

          <ReceiptDivider variant="major" />

          {/* ── ITEM ENTRIES ── */}
          {items.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <ReceiptDivider variant="decorative" />
              <div
                className="receipt-stamp text-[1rem] font-bold uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
              >
                NO ITEMS ON FILE
              </div>
              <div
                className="text-[0.75rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                {emptyMessage ?? 'CHECK BACK SOON. NEW PIECES ADDED REGULARLY.'}
              </div>
              <ReceiptDivider variant="decorative" />
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-5 py-2"
            >
              {items.map((item, index) => (
                <div key={item.id}>
                  {/* Entry header */}
                  <div
                    className="text-[0.6875rem] uppercase tracking-widest pb-1"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
                  >
                    {mode === 'browse' ? 'ITEM' : 'ENTRY'}{' '}
                    {String(index + 1).padStart(2, '0')} OF{' '}
                    {String(items.length).padStart(2, '0')}
                    &nbsp;·&nbsp;
                    {item.listing_type === 'buy_now' ? 'BUY NOW' : 'AUCTION'}
                  </div>
                  <EntryCard item={item} index={index} mode={mode} />
                  {index < items.length - 1 && (
                    <div className="pt-6">
                      <ReceiptDivider variant="minor" />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          <ReceiptDivider variant="major" />

          {/* ── FOOTER SUMMARY ── */}
          <div className="pt-2 pb-4 text-center" style={{ lineHeight: 1.5 }}>
            <div className="receipt-tear" />

            <div className="text-left px-2 mb-3" style={{ lineHeight: 1.7 }}>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">TOTAL ITEMS</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>{items.length}</span>
              </div>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">TAX-EXEMPT</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>STUDIO</span>
              </div>
              {mode === 'shop' && items.length > 0 && (
                <div
                  className="receipt-line-item text-[0.6875rem]"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
                >
                  <span className="uppercase whitespace-nowrap">SUBTOTAL</span>
                  <span className="leader" />
                  <span className="receipt-price" style={{ color: 'var(--ink)' }}>
                    $
                    {items
                      .filter((i) => !i.sold_at && i.buy_now_price != null)
                      .reduce((sum, i) => sum + (i.buy_now_price ?? 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <ReceiptDivider variant="minor" />

            <Barcode seed={catalogCode} className="mx-auto mt-2" />

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
              HANDMADE WITH LOVE
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
              TOR&apos;S BORED POTTERY CO. · BROOKLYN, NY
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              {txCode} · {today}
            </div>
          </div>
        </div>
        <div className="receipt-edge-bottom" />
      </div>
    </div>
  );
}
