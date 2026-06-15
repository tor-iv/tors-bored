import { cookies } from 'next/headers';
import { db } from '@/db';
import { items } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Y2KBrowseLayout from '@/components/theme/y2k/Y2KBrowseLayout';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptBrowseLayout from '@/components/theme/receipt/ReceiptBrowseLayout';

export default async function ShopPage() {
  const rawRows = await db
    .select()
    .from(items)
    .where(eq(items.listing_type, 'buy_now'))
    .orderBy(desc(items.created_at));

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

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme === 'y2k') {
    return <Y2KBrowseLayout items={mappedItems} heading="Shop — Buy Now" emptyMessage="No buy-now pieces available." />;
  }

  return (
    <ReceiptPage>
      <ReceiptHeader ticket="SHOP-BUY-NOW" />
      <ReceiptBrowseLayout
        items={mappedItems}
        totalCount={mappedItems.length}
        sortLabel="NEWEST FIRST"
        filterLabel="BUY NOW"
        emptyMessage="No items available for purchase right now. Check back soon."
      />
      <ReceiptFooter />
    </ReceiptPage>
  );
}
