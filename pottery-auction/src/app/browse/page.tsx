import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import HanddrawnBrowseLayout from '@/components/theme/handdrawn/HanddrawnBrowseLayout';
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
  }));

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme === 'handdrawn') {
    return <HanddrawnBrowseLayout items={items} heading="Browse All Pieces" />;
  }

  if (theme === 'y2k') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
          Browse All Pieces
        </h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <a
              key={item.id}
              href={`/piece/${item.sku}`}
              className="block border p-4 hover:opacity-80 transition-opacity"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-well)' }}
            >
              <div className="font-semibold" style={{ color: 'var(--ink)' }}>{item.title}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>{item.sku}</div>
            </a>
          ))}
        </div>
      </div>
    );
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
