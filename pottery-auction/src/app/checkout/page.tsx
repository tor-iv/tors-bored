import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { items } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import PolaroidPhoto from '@/components/theme/receipt/PolaroidPhoto';
import Badge from '@/components/ui/Badge';
import CheckoutClient from './CheckoutClient';
import SignInGate from './SignInGate';

interface Props {
  searchParams: Promise<{ sku?: string }>;
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { sku } = await searchParams;

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (!sku) {
    return (
      <ReceiptPage>
        <ReceiptHeader ticket="CHECKOUT" />
        <ReceiptDivider variant="major" />
        <div className="py-4 text-center text-[0.875rem] uppercase" style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}>
          NO ITEM SPECIFIED
        </div>
        <ReceiptDivider variant="major" />
        <ReceiptFooter />
      </ReceiptPage>
    );
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
    return (
      <ReceiptPage>
        <ReceiptHeader ticket={`CHECKOUT-${sku}`} />
        <ReceiptDivider variant="major" />
        <div className="py-4 text-center text-[0.875rem] uppercase" style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}>
          ITEM NOT FOUND
        </div>
        <ReceiptDivider variant="major" />
        <ReceiptFooter />
      </ReceiptPage>
    );
  }

  if (item.listing_type !== 'buy_now') {
    return (
      <ReceiptPage>
        <ReceiptHeader ticket={`CHECKOUT-${sku}`} />
        <ReceiptDivider variant="major" />
        <div className="py-4 text-center text-[0.875rem] uppercase" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}>
          THIS ITEM IS AUCTION ONLY
        </div>
        <ReceiptDivider variant="major" />
        <ReceiptFooter />
      </ReceiptPage>
    );
  }

  const isSold = !!item.sold_at;
  const isReservedByOther =
    item.reserved_until &&
    new Date(item.reserved_until) > new Date() &&
    item.reserved_order_id !== null;

  if (isSold || isReservedByOther) {
    return (
      <ReceiptPage>
        <ReceiptHeader ticket={`CHECKOUT-${sku}`} />
        {item.images?.[0] && (
          <div className="py-4">
            <PolaroidPhoto src={item.images[0]} alt={item.title} sku={item.sku ?? undefined} caption={item.title} />
          </div>
        )}
        <ReceiptDivider variant="major" />
        <div className="py-3 text-center space-y-2" style={{ fontFamily: 'var(--font-display)' }}>
          <div className="text-[0.875rem] font-bold uppercase" style={{ color: 'var(--error)' }}>
            {isSold ? 'ITEM SOLD' : 'TEMPORARILY UNAVAILABLE'}
          </div>
          <Badge intent="error">
            {isSold ? 'SOLD' : 'RESERVED'}
          </Badge>
          <div className="text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
            {isSold
              ? 'This piece has found its home.'
              : 'This item is currently being purchased. Check back in a few minutes.'}
          </div>
        </div>
        <ReceiptDivider variant="major" />
        <ReceiptFooter />
      </ReceiptPage>
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

  const now = new Date();

  return (
    <ReceiptPage>
      <ReceiptHeader ticket={`CHECKOUT-${sku}`} date={now} />

      {/* Item photo */}
      {item.images?.[0] && (
        <div className="py-4">
          <PolaroidPhoto src={item.images[0]} alt={item.title} sku={item.sku ?? undefined} caption={item.title} />
        </div>
      )}

      {/* Item header */}
      <ReceiptDivider variant="major" />
      <div className="py-2 space-y-0.5 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>SKU</span>
          <span className="font-semibold">{item.sku}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>ITEM</span>
          <span>{item.title}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[0.6875rem] w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>PRICE</span>
          <span className="receipt-price font-bold">{formatPrice(item.buy_now_price)}</span>
        </div>
      </div>

      {/* Checkout form — client component handles PI creation + Stripe Elements */}
      <CheckoutClient
        item={{
          id: item.id,
          sku: item.sku ?? sku,
          title: item.title,
          buyNowPrice: item.buy_now_price ?? 0,
        }}
      />

      <div className="py-2 text-[0.6875rem] text-center uppercase" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}>
        RESERVATION HELD FOR 15 MINUTES
      </div>
      <ReceiptDivider variant="major" />

      <ReceiptFooter />
    </ReceiptPage>
  );
}
