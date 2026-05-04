import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
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
  }));

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme !== 'receipt') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
          Shop — Buy Now
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
              <div className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
                ${item.buyNowPrice?.toFixed(2)} — {item.sku}
              </div>
            </a>
          ))}
          {items.length === 0 && (
            <p style={{ color: 'var(--ink-muted)' }}>No items available for purchase right now.</p>
          )}
        </div>
      </div>
    );
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
