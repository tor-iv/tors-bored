import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import ReceiptBrowseLayout from '@/components/theme/receipt/ReceiptBrowseLayout';
import PolaroidPhoto from '@/components/theme/receipt/PolaroidPhoto';

export default async function Home() {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme !== 'receipt') {
    return <HomeClient />;
  }

  // Receipt theme: fetch real data
  const supabase = await createClient();

  const [featuredResult, auctionResult, shopResult] = await Promise.all([
    supabase
      .from('items')
      .select('*')
      .eq('featured', true)
      .is('sold_at', null)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('items')
      .select('*, auction:auctions(end_date, extended_end_date, status)')
      .eq('listing_type', 'auction')
      .is('sold_at', null)
      .not('auction_id', 'is', null)
      .limit(6),
    supabase
      .from('items')
      .select('*')
      .eq('listing_type', 'buy_now')
      .is('sold_at', null)
      .limit(6),
  ]);

  const featuredItem = featuredResult.data;
  const auctionItems = (auctionResult.data ?? [])
    .filter((i: any) => i.auction?.status === 'active')
    .map((i: any) => ({
      id: i.id,
      sku: i.sku ?? 'OBJ-????',
      title: i.title,
      listingType: 'auction' as const,
      currentBid: i.current_bid,
      startingBid: i.starting_bid,
      endDate: i.auction?.extended_end_date ?? i.auction?.end_date,
      soldAt: i.sold_at,
      techniques: i.techniques,
    }));
  const shopItems = (shopResult.data ?? []).map((i: any) => ({
    id: i.id,
    sku: i.sku ?? 'OBJ-????',
    title: i.title,
    listingType: 'buy_now' as const,
    buyNowPrice: i.buy_now_price,
    soldAt: i.sold_at,
    reservedUntil: i.reserved_until,
    techniques: i.techniques,
  }));

  return (
    <ReceiptPage>
      <ReceiptHeader subtitle="BROOKLYN, NY" />

      {/* Featured piece */}
      {featuredItem && (
        <div className="py-4">
          <div className="text-[0.875rem] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--ink)' }}>
            FEATURED PIECE
          </div>
          {featuredItem.images?.[0] ? (
            <PolaroidPhoto
              src={featuredItem.images[0]}
              alt={featuredItem.title}
              sku={featuredItem.sku ?? undefined}
              caption={featuredItem.title}
            />
          ) : (
            <div
              className="border border-[var(--border)] p-8 text-center text-[0.875rem] uppercase"
              style={{ color: 'var(--ink-muted)', backgroundColor: 'var(--bg-well)' }}
            >
              [{featuredItem.sku}] — {featuredItem.title.toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Active auctions */}
      {auctionItems.length > 0 && (
        <>
          <ReceiptDivider variant="major" />
          <div className="py-2 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
            ACTIVE AUCTIONS ({auctionItems.length})
          </div>
          <ReceiptBrowseLayout items={auctionItems} totalCount={auctionItems.length} />
        </>
      )}

      {/* Buy now */}
      {shopItems.length > 0 && (
        <>
          <ReceiptDivider variant="major" />
          <div className="py-2 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
            AVAILABLE BUY-NOW ({shopItems.length})
          </div>
          <ReceiptBrowseLayout items={shopItems} totalCount={shopItems.length} />
        </>
      )}

      {auctionItems.length === 0 && shopItems.length === 0 && !featuredItem && (
        <>
          <ReceiptDivider variant="major" />
          <div className="py-4 text-center text-[0.875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
            NO ITEMS CURRENTLY AVAILABLE
          </div>
          <div className="py-2 text-center text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
            Check back soon. New pieces added monthly.
          </div>
          <ReceiptDivider variant="major" />
        </>
      )}

      <ReceiptFooter />
    </ReceiptPage>
  );
}
