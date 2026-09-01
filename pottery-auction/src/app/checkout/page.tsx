import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { items } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptChrome from '@/components/theme/receipt/ReceiptChrome';
import ReceiptFooterChrome from '@/components/theme/receipt/ReceiptFooterChrome';
import ReceiptPhotoFrame from '@/components/theme/receipt/ReceiptPhotoFrame';
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
    <ReceiptPage>
      <ReceiptChrome />
      <div className="receipt-section-bar" style={{ margin: '18px 0 4px' }}>
        <span>PURCHASE RECEIPT</span>
        <span className="receipt-section-bar-count">{sku ? sku.toUpperCase() : 'CHECKOUT'}</span>
      </div>
      <div
        className="flex flex-wrap justify-between"
        style={{ gap: '2px 12px', fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)', padding: '6px 0 10px' }}
      >
        <span>TICKET: {ticketCode}</span>
        <span>DATE: {dateStr} · RESERVATION HELD 15 MIN</span>
      </div>

      {children}

      <ReceiptFooterChrome barcodeSeed={ticketCode} />
    </ReceiptPage>
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
        <div className="py-4">
          <ReceiptPhotoFrame
            src={item.images?.[0]}
            alt={item.title}
            title={item.title}
            size="lg"
            stamp={{ label: isSold ? 'SOLD' : 'RESERVED', variant: 'red', rotate: -4 }}
          />
        </div>
        <ReceiptDivider variant="major" />
        <div className="py-3 text-center space-y-2" style={{ fontFamily: 'var(--font-display)' }}>
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
      {/* Item photo */}
      <div className="py-4">
        <ReceiptPhotoFrame src={item.images?.[0]} alt={item.title} title={item.title} size="lg" />
      </div>

      {/* Item header — leader-dot rows */}
      <div className="receipt-section-bar" style={{ margin: '4px 0 8px' }}>
        <span>ITEM DETAIL</span>
      </div>
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
