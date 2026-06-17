import { cookies } from 'next/headers';
import { db } from '@/db';
import { items } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Y2KBrowseLayout from '@/components/theme/y2k/Y2KBrowseLayout';
import ReceiptCatalogLayout from '@/components/theme/receipt/ReceiptCatalogLayout';

export default async function ShopPage() {
  // ── Shared data fetch (buy_now only) ──────────────────────────────────────
  const rawRows = await db
    .select()
    .from(items)
    .where(eq(items.listing_type, 'buy_now'))
    .orderBy(desc(items.created_at));

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  // ── Y2K branch (camelCase props — unchanged) ───────────────────────────────
  if (theme === 'y2k') {
    const mappedItems = rawRows.map((r) => ({
      id: r.id,
      sku: r.sku ?? 'OBJ-????',
      title: r.title,
      listingType: 'buy_now' as const,
      buyNowPrice: r.buy_now_price ?? undefined,
      soldAt: r.sold_at ? r.sold_at.toISOString() : null,
      reservedUntil: r.reserved_until ? r.reserved_until.toISOString() : null,
      techniques: r.techniques ?? [],
      images: r.images ?? [],
    }));

    return (
      <Y2KBrowseLayout
        items={mappedItems}
        heading="Shop — Buy Now"
        emptyMessage="No buy-now pieces available."
      />
    );
  }

  // ── Receipt branch (snake_case — matches CatalogItem) ─────────────────────
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const receivedLabel = now.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

  const catalogItems = rawRows.map((r) => ({
    id: r.id,
    sku: r.sku ?? 'OBJ-????',
    title: r.title,
    listing_type: 'buy_now' as const,
    buy_now_price: r.buy_now_price ?? null,
    current_bid: null,
    starting_bid: null,
    end_date: null,
    sold_at: r.sold_at ? r.sold_at.toISOString() : null,
    reserved_until: r.reserved_until ? r.reserved_until.toISOString() : null,
    techniques: r.techniques ?? [],
    images: r.images ?? [],
  }));

  return (
    <ReceiptCatalogLayout
      items={catalogItems}
      mode="shop"
      catalogCode="SHOP-BUY-NOW"
      catalogTitle="BUY-NOW COUNTER"
      emptyMessage="NO BUY-NOW PIECES AVAILABLE RIGHT NOW. CHECK BACK SOON."
      dateStr={dateStr}
      receivedLabel={receivedLabel}
    />
  );
}
