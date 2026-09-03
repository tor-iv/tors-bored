import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { items, auctions, bids } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Y2KPieceDetail from '@/components/theme/y2k/Y2KPieceDetail';
import ReceiptPieceDetail from '@/components/theme/receipt/ReceiptPieceDetail';

interface Props {
  params: Promise<{ sku: string }>;
}

function isCurrentlyReserved(item: { reserved_until: Date | null; sold_at: Date | null }): boolean {
  return !!item.reserved_until && new Date(item.reserved_until) > new Date() && !item.sold_at;
}

export default async function PiecePage({ params }: Props) {
  const { sku } = await params;

  // Fetch item with auction join
  const [itemRow] = await db
    .select({ i: items, a: auctions })
    .from(items)
    .leftJoin(auctions, eq(items.auction_id, auctions.id))
    .where(eq(items.sku, sku))
    .limit(1);

  if (!itemRow) notFound();

  const item = itemRow.i;
  const auction = itemRow.a ?? null;

  // Fetch bid history
  const bidRows = await db
    .select({
      id: bids.id,
      amount: bids.amount,
      status: bids.status,
      created_at: bids.created_at,
      user_id: bids.user_id,
    })
    .from(bids)
    .where(eq(bids.item_id, item.id))
    .orderBy(desc(bids.created_at))
    .limit(20);

  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'receipt';

  const isSold = !!item.sold_at;
  const isReserved = isCurrentlyReserved(item);
  const isAuction = item.listing_type === 'auction';
  const isBuyNow = item.listing_type === 'buy_now';
  const auctionActive = auction?.status === 'active';
  const reserveMet = !auction?.reserve_price || (item.current_bid ?? 0) >= auction.reserve_price;
  // Compute today on the server and pass as a stable string to avoid SSR/client hydration mismatch
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

  if (theme === 'y2k') {
    const itemWithAuction = { ...item, auction };
    return <Y2KPieceDetail item={itemWithAuction} bids={bidRows} sku={sku} />;
  }

  return (
    <ReceiptPieceDetail
      item={item}
      auction={auction}
      bids={bidRows}
      sku={sku}
      isSold={isSold}
      isReserved={isReserved}
      isAuction={isAuction}
      isBuyNow={isBuyNow}
      auctionActive={auctionActive}
      reserveMet={reserveMet}
      today={today}
    />
  );
}
