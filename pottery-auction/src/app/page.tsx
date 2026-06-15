import { cookies } from 'next/headers';
import { db } from '@/db';
import { items, auctions } from '@/db/schema';
import { eq, isNull, isNotNull } from 'drizzle-orm';
import HomeClient from './HomeClient';
import Y2KHome from '@/components/theme/y2k/Y2KHome';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import ReceiptBrowseLayout from '@/components/theme/receipt/ReceiptBrowseLayout';
import PolaroidPhoto from '@/components/theme/receipt/PolaroidPhoto';

export default async function Home() {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  if (theme === 'y2k') {
    // Fetch data for Y2K home too
    const [featuredRows, activeRows, shopRows] = await Promise.all([
      db
        .select()
        .from(items)
        .where(eq(items.featured, true))
        // isNull requires a separate where clause; chain with and() if needed, but these are separate queries
        .limit(1),
      db
        .select({ i: items, a: auctions })
        .from(items)
        .leftJoin(auctions, eq(items.auction_id, auctions.id))
        .where(eq(items.listing_type, 'auction'))
        .limit(6),
      db
        .select()
        .from(items)
        .where(eq(items.listing_type, 'buy_now'))
        .limit(6),
    ]);

    // Filter featured to unsold
    const featuredRow = featuredRows.find((r) => !r.sold_at) ?? null;

    const activeAuctions = activeRows
      .filter((r) => !r.i.sold_at && r.i.auction_id !== null && r.a?.status === 'active')
      .map((r) => {
        const endDateRaw = r.a?.extended_end_date ?? r.a?.end_date;
        return {
          id: r.i.id,
          sku: r.i.sku ?? 'OBJ-????',
          title: r.i.title,
          images: r.i.images,
          currentBid: r.i.current_bid,
          startingBid: r.i.starting_bid,
          endDate: endDateRaw ? endDateRaw.toISOString() : undefined,
        };
      });

    const shopItemsMapped = shopRows
      .filter((r) => !r.sold_at)
      .map((r) => ({
        id: r.id,
        sku: r.sku ?? 'OBJ-????',
        title: r.title,
        images: r.images,
        buyNowPrice: r.buy_now_price,
      }));

    const feat = featuredRow;
    const mappedFeatured = feat
      ? {
          id: feat.id,
          sku: feat.sku ?? 'OBJ-????',
          title: feat.title,
          images: feat.images ?? undefined,
          current_bid: feat.current_bid,
          buy_now_price: feat.buy_now_price,
          listing_type: feat.listing_type ?? undefined,
        }
      : null;

    return <Y2KHome featuredItem={mappedFeatured} auctionItems={activeAuctions} shopItems={shopItemsMapped} />;
  }

  // receipt: falls through to receipt code below
  if (theme !== 'receipt') return <HomeClient />;

  // Receipt theme: fetch real data
  const [featuredRows, activeRows, shopRows] = await Promise.all([
    db
      .select()
      .from(items)
      .where(eq(items.featured, true))
      .limit(1),
    db
      .select({ i: items, a: auctions })
      .from(items)
      .leftJoin(auctions, eq(items.auction_id, auctions.id))
      .where(eq(items.listing_type, 'auction'))
      .limit(6),
    db
      .select()
      .from(items)
      .where(eq(items.listing_type, 'buy_now'))
      .limit(6),
  ]);

  // featured: unsold only
  const featuredItem = featuredRows.find((r) => !r.sold_at) ?? null;

  const auctionItems = activeRows
    .filter((r) => !r.i.sold_at && r.i.auction_id !== null && r.a?.status === 'active')
    .map((r) => {
      const endDateRaw = r.a?.extended_end_date ?? r.a?.end_date;
      return {
        id: r.i.id,
        sku: r.i.sku ?? 'OBJ-????',
        title: r.i.title,
        listingType: 'auction' as const,
        currentBid: r.i.current_bid ?? undefined,
        startingBid: r.i.starting_bid ?? undefined,
        endDate: endDateRaw ? endDateRaw.toISOString() : undefined,
        soldAt: r.i.sold_at ? r.i.sold_at.toISOString() : null,
        techniques: r.i.techniques,
      };
    });

  const shopItems = shopRows
    .filter((r) => !r.sold_at)
    .map((r) => ({
      id: r.id,
      sku: r.sku ?? 'OBJ-????',
      title: r.title,
      listingType: 'buy_now' as const,
      buyNowPrice: r.buy_now_price ?? undefined,
      soldAt: r.sold_at ? r.sold_at.toISOString() : null,
      reservedUntil: r.reserved_until ? r.reserved_until.toISOString() : null,
      techniques: r.techniques,
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
