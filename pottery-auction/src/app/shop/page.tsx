import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import Y2KBrowseLayout from '@/components/theme/y2k/Y2KBrowseLayout';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptBrowseLayout from '@/components/theme/receipt/ReceiptBrowseLayout';

export default async function ShopPage() {
  const supabase = await createClient();

  const { data: rawItems } = await supabase
    .from('items')
    .select('*')
    .eq('listing_type', 'buy_now')
    .order('created_at', { ascending: false });

  const items = (rawItems ?? []).map((i: any) => ({
    id: i.id,
    sku: i.sku ?? 'OBJ-????',
    title: i.title,
    listingType: 'buy_now' as const,
    buyNowPrice: i.buy_now_price,
    soldAt: i.sold_at,
    reservedUntil: i.reserved_until,
    techniques: i.techniques ?? [],
    images: i.images ?? [],
  }));

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme === 'y2k') {
    return <Y2KBrowseLayout items={items} heading="Shop — Buy Now" emptyMessage="No buy-now pieces available." />;
  }

  return (
    <ReceiptPage>
      <ReceiptHeader ticket="SHOP-BUY-NOW" />
      <ReceiptBrowseLayout
        items={items}
        totalCount={items.length}
        sortLabel="NEWEST FIRST"
        filterLabel="BUY NOW"
        emptyMessage="No items available for purchase right now. Check back soon."
      />
      <ReceiptFooter />
    </ReceiptPage>
  );
}
