import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import Y2KBrowseLayout from '@/components/theme/y2k/Y2KBrowseLayout';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptBrowseLayout from '@/components/theme/receipt/ReceiptBrowseLayout';

export default async function BrowsePage() {
  const supabase = await createClient();

  const { data: rawItems } = await supabase
    .from('items')
    .select('*, auction:auctions(end_date, extended_end_date, status)')
    .order('created_at', { ascending: false });

  const items = (rawItems ?? []).map((i: any) => ({
    id: i.id,
    sku: i.sku ?? 'OBJ-????',
    title: i.title,
    listingType: i.listing_type as 'auction' | 'buy_now',
    buyNowPrice: i.buy_now_price,
    currentBid: i.current_bid,
    startingBid: i.starting_bid,
    endDate: i.auction?.extended_end_date ?? i.auction?.end_date,
    soldAt: i.sold_at,
    reservedUntil: i.reserved_until,
    techniques: i.techniques ?? [],
    images: i.images ?? [],
  }));

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme === 'y2k') {
    return <Y2KBrowseLayout items={items} heading="Browse All Pieces" />;
  }

  return (
    <ReceiptPage>
      <ReceiptHeader ticket="BROWSE-ALL" />
      <ReceiptBrowseLayout
        items={items}
        totalCount={items.length}
        sortLabel="NEWEST FIRST"
        filterLabel="ALL"
      />
      <ReceiptFooter />
    </ReceiptPage>
  );
}
