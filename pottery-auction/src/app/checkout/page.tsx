import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { items } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import PolaroidPhoto from '@/components/theme/receipt/PolaroidPhoto';
import CheckoutClient from './CheckoutClient';
import SignInGate from './SignInGate';

interface Props {
  searchParams: Promise<{ sku?: string }>;
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

// ─── Shared receipt shell ─────────────────────────────────────────────────────

function ReceiptShell({
  sku,
  dateStr,
  ticketCode,
  children,
}: {
  sku?: string;
  dateStr: string;
  ticketCode: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: 'var(--bg-well)', minHeight: '100vh', padding: '32px 16px 80px' }}>
      <div
        className="receipt-strip-paper"
        style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}
      >
        {/* Top-right stamp: INVOICE */}
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
          INVOICE
          <div style={{ fontSize: '0.4rem', letterSpacing: '0.22em', marginTop: 2 }}>● PURCHASE ORDER ●</div>
        </div>

        {/* Top-left stamp: circular date stamp */}
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
              ★ PURCHASE RECEIPT ★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★★★ HANDMADE POTTERY ★★★
            </div>

            <ReceiptDivider variant="decorative" />

            <div
              className="text-[0.6875rem] mt-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              <span>TICKET: {ticketCode}</span>
              {sku && <span> &nbsp;·&nbsp; SKU: {sku}</span>}
            </div>
            <div
              className="text-[0.6875rem]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              DATE: {dateStr}
            </div>
          </div>

          {children}

          {/* Receipt tear + footer */}
          <div className="receipt-tear" />
          <div className="py-2 space-y-0.5 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}>
            <div className="text-[0.625rem] uppercase tracking-widest">★ THANK YOU ★</div>
            <div className="text-[0.5rem] uppercase tracking-widest">ALL SALES FINAL · HANDMADE WITH CARE</div>
            <div className="text-[0.5rem] uppercase tracking-widest">RESERVATION HELD FOR 15 MINUTES</div>
          </div>
          <ReceiptDivider variant="decorative" />
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

// ─── Error shell (minimal — for early-return branches) ────────────────────────

function ErrorShell({ message }: { message: string }) {
  const dateStr = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  return (
    <ReceiptShell dateStr={dateStr} ticketCode="CHECKOUT" sku={undefined}>
      <ReceiptDivider variant="major" />
      <div
        className="py-4 text-center text-[0.875rem] uppercase"
        style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}
      >
        {message}
      </div>
      <ReceiptDivider variant="major" />
    </ReceiptShell>
  );
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { sku } = await searchParams;

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (!sku) {
    return <ErrorShell message="NO ITEM SPECIFIED" />;
  }

  const user = await getCurrentUser();

  if (!user) {
    return <SignInGate sku={sku} />;
  }

  const [item] = await db
    .select({
      id: items.id,
      sku: items.sku,
      title: items.title,
      listing_type: items.listing_type,
      buy_now_price: items.buy_now_price,
      sold_at: items.sold_at,
      reserved_until: items.reserved_until,
      reserved_order_id: items.reserved_order_id,
      images: items.images,
    })
    .from(items)
    .where(eq(items.sku, sku))
    .limit(1);

  if (!item) {
    return <ErrorShell message="ITEM NOT FOUND" />;
  }

  if (item.listing_type !== 'buy_now') {
    return <ErrorShell message="THIS ITEM IS AUCTION ONLY" />;
  }

  const isSold = !!item.sold_at;
  const isReservedByOther =
    item.reserved_until &&
    new Date(item.reserved_until) > new Date() &&
    item.reserved_order_id !== null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const ticketCode = `CHECKOUT-${sku.toUpperCase()}`;

  if (isSold || isReservedByOther) {
    return (
      <ReceiptShell dateStr={dateStr} ticketCode={ticketCode} sku={sku}>
        {item.images?.[0] && (
          <div className="py-4">
            <PolaroidPhoto src={item.images[0]} alt={item.title} sku={item.sku ?? undefined} caption={item.title} />
          </div>
        )}
        <ReceiptDivider variant="major" />
        <div className="py-3 text-center space-y-2" style={{ fontFamily: 'var(--font-display)' }}>
          {/* Inline stamp — SOLD or RESERVED */}
          <div
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-stamp)',
              color: isSold ? 'var(--error)' : 'var(--ink)',
              border: `2.5px solid ${isSold ? 'var(--error)' : 'var(--ink)'}`,
              borderRadius: 3,
              padding: '4px 14px 3px',
              fontSize: '1.3rem',
              letterSpacing: '0.12em',
              transform: 'rotate(-2deg)',
              mixBlendMode: 'multiply',
              opacity: 0.85,
            }}
          >
            {isSold ? 'SOLD' : 'RESERVED'}
          </div>
          <div className="text-[0.875rem] font-bold uppercase" style={{ color: isSold ? 'var(--error)' : 'var(--ink)' }}>
            {isSold ? 'ITEM SOLD' : 'TEMPORARILY UNAVAILABLE'}
          </div>
          <div className="text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
            {isSold
              ? 'This piece has found its home.'
              : 'This item is currently being purchased. Check back in a few minutes.'}
          </div>
        </div>
        <ReceiptDivider variant="major" />
      </ReceiptShell>
    );
  }

  if (theme !== 'receipt') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
          Checkout
        </h1>
        <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
          {item.title} — {formatPrice(item.buy_now_price)}
        </p>
        <CheckoutClient
          item={{
            id: item.id,
            sku: item.sku ?? sku,
            title: item.title,
            buyNowPrice: item.buy_now_price ?? 0,
          }}
        />
      </div>
    );
  }

  return (
    <ReceiptShell dateStr={dateStr} ticketCode={ticketCode} sku={sku}>
      {/* Item polaroid */}
      {item.images?.[0] && (
        <div className="py-4">
          <PolaroidPhoto
            src={item.images[0]}
            alt={item.title}
            sku={item.sku ?? undefined}
            caption={item.title}
          />
        </div>
      )}

      {/* Item header — leader-dot rows */}
      <ReceiptDivider variant="major" />
      <div
        className="text-[0.625rem] uppercase tracking-widest pb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        ITEM DETAIL
      </div>
      <ReceiptDivider variant="minor" />
      <div className="py-2 space-y-1">
        <div
          className="receipt-line-item"
          style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
        >
          <span className="uppercase whitespace-nowrap">SKU</span>
          <span className="leader" aria-hidden="true" />
          <span style={{ color: 'var(--ink)' }}>{item.sku}</span>
        </div>
        <div
          className="receipt-line-item"
          style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
        >
          <span className="uppercase whitespace-nowrap">ITEM</span>
          <span className="leader" aria-hidden="true" />
          <span style={{ color: 'var(--ink)' }}>{item.title}</span>
        </div>
        <div
          className="receipt-line-item"
          style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
        >
          <span className="uppercase whitespace-nowrap">TYPE</span>
          <span className="leader" aria-hidden="true" />
          <span style={{ color: 'var(--ink)' }}>BUY NOW</span>
        </div>
        <div
          className="receipt-line-item"
          style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}
        >
          <span className="uppercase whitespace-nowrap">LIST PRICE</span>
          <span className="leader" aria-hidden="true" />
          <span
            className="receipt-price"
            style={{
              color: 'var(--ink)',
              fontFamily: 'var(--font-thermal)',
              fontSize: '1.1rem',
            }}
          >
            {formatPrice(item.buy_now_price)}
          </span>
        </div>
      </div>

      {/* CheckoutClient: fetches PI, shows order summary with totals, and Stripe form */}
      <CheckoutClient
        item={{
          id: item.id,
          sku: item.sku ?? sku,
          title: item.title,
          buyNowPrice: item.buy_now_price ?? 0,
        }}
      />
    </ReceiptShell>
  );
}
