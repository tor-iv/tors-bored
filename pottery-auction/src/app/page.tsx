import { cookies } from 'next/headers';
import Link from 'next/link';
import { db } from '@/db';
import { items, auctions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import HomeClient from './HomeClient';
import Y2KHome from '@/components/theme/y2k/Y2KHome';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptChrome from '@/components/theme/receipt/ReceiptChrome';
import ReceiptFooterChrome from '@/components/theme/receipt/ReceiptFooterChrome';
import ReceiptPhotoFrame from '@/components/theme/receipt/ReceiptPhotoFrame';

function endsIn(endDate?: string): string {
  if (!endDate) return '—';
  const ms = new Date(endDate).getTime() - Date.now();
  if (ms <= 0) return 'ENDED';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}H ${m}M`;
}

function money(n?: number | null): string {
  return `$${(n ?? 0).toFixed(2)}`;
}

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
        images: r.i.images,
        currentBid: r.i.current_bid ?? undefined,
        startingBid: r.i.starting_bid ?? undefined,
        endDate: endDateRaw ? endDateRaw.toISOString() : undefined,
        techniques: r.i.techniques,
      };
    });

  const shopItems = shopRows
    .filter((r) => !r.sold_at && r.id !== featuredItem?.id)
    .map((r) => ({
      id: r.id,
      sku: r.sku ?? 'OBJ-????',
      title: r.title,
      images: r.images,
      buyNowPrice: r.buy_now_price ?? undefined,
      techniques: r.techniques,
    }));

  const featuredPrice = featuredItem
    ? featuredItem.listing_type === 'buy_now'
      ? featuredItem.buy_now_price
      : (featuredItem.current_bid ?? featuredItem.starting_bid)
    : null;
  const featuredHref = featuredItem
    ? featuredItem.listing_type === 'buy_now'
      ? `/checkout?sku=${featuredItem.sku}`
      : `/piece/${featuredItem.sku}`
    : '/';
  const showingCount = auctionItems.length + shopItems.length + (featuredItem ? 1 : 0);
  const tags = (t: string[]) => t.map((s) => s.toUpperCase()).join(' · ');

  return (
    <ReceiptPage>
      <ReceiptChrome />

      {/* Featured piece */}
      {featuredItem && (
        <>
          <div className="receipt-section-bar" style={{ margin: '18px 0 14px' }}>
            <span>FEATURED PIECE</span>
            <span className="receipt-section-bar-count">№ 001</span>
          </div>
          <ReceiptPhotoFrame
            src={featuredItem.images?.[0]}
            alt={featuredItem.title}
            title={featuredItem.title}
            size="lg"
            stamp={{ label: 'AUTHENTIC', rotate: 4 }}
          />
          <div className="receipt-line-item" style={{ marginTop: 12, gap: 8 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{featuredItem.title}</div>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                {featuredItem.sku} · {tags(featuredItem.techniques ?? [])}
              </div>
            </div>
            <span className="leader" />
            <div style={{ fontFamily: 'var(--font-thermal)', fontSize: 34, lineHeight: 1 }}>
              {money(featuredPrice)}
            </div>
          </div>
          <div className="flex justify-end" style={{ marginTop: 8 }}>
            <Link href={featuredHref} className="receipt-action-btn">
              {featuredItem.listing_type === 'buy_now' ? 'BUY NOW' : 'VIEW LOT'}
            </Link>
          </div>
        </>
      )}

      {/* Active auctions */}
      {auctionItems.length > 0 && (
        <>
          <div className="receipt-section-bar" style={{ margin: '26px 0 4px' }}>
            <span>ACTIVE AUCTIONS</span>
            <span className="receipt-section-bar-count">QTY {auctionItems.length}</span>
          </div>
          <div
            className="flex justify-between"
            style={{ fontSize: 10, letterSpacing: 1, color: 'var(--ink-muted)', padding: '6px 0 2px' }}
          >
            <span>FILTER: [ALL]</span>
            <span>SORT: [ENDING SOON]</span>
          </div>
          {auctionItems.map((item) => (
            <div
              key={item.id}
              className="grid"
              style={{
                gridTemplateColumns: '86px 1fr',
                gap: 14,
                padding: '14px 0',
                borderBottom: '1px dashed var(--border)',
              }}
            >
              <ReceiptPhotoFrame src={item.images?.[0]} alt={item.title} title={item.title} size="sm" />
              <div className="flex min-w-0 flex-col" style={{ gap: 3 }}>
                <div className="receipt-line-item" style={{ gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{item.title}</span>
                  <span className="leader" />
                  <span style={{ fontFamily: 'var(--font-thermal)', fontSize: 26, lineHeight: 1 }}>
                    {money(item.currentBid ?? item.startingBid)}
                  </span>
                </div>
                <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)' }}>
                  {item.sku} · {tags(item.techniques ?? [])}
                </div>
                <div className="flex items-baseline justify-between" style={{ marginTop: 'auto' }}>
                  <span style={{ fontFamily: 'var(--font-thermal)', fontSize: 19, color: 'var(--error)' }}>
                    ENDS {endsIn(item.endDate)}
                  </span>
                  <Link href={`/piece/${item.sku}`} className="receipt-view-item-link">
                    VIEW ITEM →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Buy now */}
      {shopItems.length > 0 && (
        <>
          <div className="receipt-section-bar" style={{ margin: '26px 0 4px' }}>
            <span>AVAILABLE BUY-NOW</span>
            <span className="receipt-section-bar-count">QTY {shopItems.length}</span>
          </div>
          {shopItems.map((item) => (
            <div
              key={item.id}
              className="grid"
              style={{
                gridTemplateColumns: '86px 1fr',
                gap: 14,
                padding: '14px 0',
                borderBottom: '1px dashed var(--border)',
              }}
            >
              <ReceiptPhotoFrame src={item.images?.[0]} alt={item.title} title={item.title} size="sm" />
              <div className="flex min-w-0 flex-col" style={{ gap: 3 }}>
                <div className="receipt-line-item" style={{ gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{item.title}</span>
                  <span className="leader" />
                  <span style={{ fontFamily: 'var(--font-thermal)', fontSize: 26, lineHeight: 1 }}>
                    {money(item.buyNowPrice)}
                  </span>
                </div>
                <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)' }}>
                  {item.sku} · {tags(item.techniques ?? [])}
                </div>
                <div className="flex items-baseline justify-between" style={{ marginTop: 'auto' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--accent)' }}>
                    BUY NOW
                  </span>
                  <Link href={`/piece/${item.sku}`} className="receipt-view-item-link">
                    VIEW ITEM →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {showingCount > 0 ? (
        <div
          className="text-center"
          style={{ fontSize: 10, letterSpacing: 2, color: 'var(--ink-muted)', padding: '12px 0 0' }}
        >
          SHOWING: {showingCount} ITEM{showingCount === 1 ? '' : 'S'}
        </div>
      ) : (
        <div className="py-4 text-center" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
          NO ITEMS CURRENTLY AVAILABLE — CHECK BACK SOON
        </div>
      )}

      <ReceiptFooterChrome barcodeSeed="TORS-BORED-HOME" />
    </ReceiptPage>
  );
}
