import { cookies } from 'next/headers';
import { db } from '@/db';
import { items, auctions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Y2KBrowseLayout from '@/components/theme/y2k/Y2KBrowseLayout';
import ReceiptCatalogLayout from '@/components/theme/receipt/ReceiptCatalogLayout';

export default async function BrowsePage() {
  // ── Shared data fetch ──────────────────────────────────────────────────────
  const rawRows = await db
    .select({ i: items, a: auctions })
    .from(items)
    .leftJoin(auctions, eq(items.auction_id, auctions.id))
    .orderBy(desc(items.created_at));

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  // ── Y2K branch (camelCase props — unchanged) ───────────────────────────────
  if (theme === 'y2k') {
    const mappedItems = rawRows.map((r) => {
      const endDateRaw = r.a?.extended_end_date ?? r.a?.end_date;
      return {
        id: r.i.id,
        sku: r.i.sku ?? 'OBJ-????',
        title: r.i.title,
        listingType: r.i.listing_type as 'auction' | 'buy_now',
        buyNowPrice: r.i.buy_now_price ?? undefined,
        currentBid: r.i.current_bid ?? undefined,
        startingBid: r.i.starting_bid ?? undefined,
        endDate: endDateRaw ? endDateRaw.toISOString() : undefined,
        soldAt: r.i.sold_at ? r.i.sold_at.toISOString() : null,
        reservedUntil: r.i.reserved_until ? r.i.reserved_until.toISOString() : null,
        techniques: r.i.techniques ?? [],
        images: r.i.images ?? [],
        createdAt: r.i.created_at ? r.i.created_at.toISOString() : null,
      };
    });

    return <Y2KBrowseLayout items={mappedItems} heading="Browse All Pieces" />;
  }

  // ── Receipt branch (snake_case — matches CatalogItem) ─────────────────────
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const receivedLabel = now.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

  const catalogItems = rawRows.map((r) => {
    const endDateRaw = r.a?.extended_end_date ?? r.a?.end_date;
    return {
      id: r.i.id,
      sku: r.i.sku ?? 'OBJ-????',
      title: r.i.title,
      listing_type: r.i.listing_type as 'auction' | 'buy_now',
      buy_now_price: r.i.buy_now_price ?? null,
      current_bid: r.i.current_bid ?? null,
      starting_bid: r.i.starting_bid ?? null,
      end_date: endDateRaw ? endDateRaw.toISOString() : null,
      sold_at: r.i.sold_at ? r.i.sold_at.toISOString() : null,
      reserved_until: r.i.reserved_until ? r.i.reserved_until.toISOString() : null,
      techniques: r.i.techniques ?? [],
      images: r.i.images ?? [],
    };
  });

  return (
    <ReceiptCatalogLayout
      items={catalogItems}
      mode="browse"
      catalogCode="BROWSE-ALL"
      catalogTitle="INVENTORY LIST"
      dateStr={dateStr}
      receivedLabel={receivedLabel}
    />
  );
}
