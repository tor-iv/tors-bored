import { cookies } from 'next/headers';
import { db } from '@/db';
import { items, auctions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Y2KBrowseLayout from '@/components/theme/y2k/Y2KBrowseLayout';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptBrowseLayout from '@/components/theme/receipt/ReceiptBrowseLayout';

export default async function BrowsePage() {
  const rawRows = await db
    .select({ i: items, a: auctions })
    .from(items)
    .leftJoin(auctions, eq(items.auction_id, auctions.id))
    .orderBy(desc(items.created_at));

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

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme === 'y2k') {
    return <Y2KBrowseLayout items={mappedItems} heading="Browse All Pieces" />;
  }

  return (
    <ReceiptPage>
      <ReceiptHeader ticket="BROWSE-ALL" />
      <ReceiptBrowseLayout
        items={mappedItems}
        totalCount={mappedItems.length}
        sortLabel="NEWEST FIRST"
        filterLabel="ALL"
      />
      <ReceiptFooter />
    </ReceiptPage>
  );
}
