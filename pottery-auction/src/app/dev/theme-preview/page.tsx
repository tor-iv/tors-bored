import ReceiptPieceDetail from '@/components/theme/receipt/ReceiptPieceDetail';
import Y2KPieceDetail from '@/components/theme/y2k/Y2KPieceDetail';

// Dev-only side-by-side comparison of the receipt and y2k themes against the
// same fixture data. Not linked from nav — visit /dev/theme-preview directly.
// Each column is its own [data-theme] scope so both themes render at once,
// instead of relying on the cookie-driven toggle (which reloads the page and
// only ever shows one theme).

const FIXTURE_AUCTION = {
  id: 'fixture-auction-1',
  status: 'active',
  end_date: new Date('2026-07-15T18:00:00Z'),
  extended_end_date: null,
  reserve_price: 60,
};

const FIXTURE_ITEM = {
  id: 'fixture-item-1',
  title: 'Speckled Stoneware Vase',
  description:
    'A tall speckled stoneware vase, wheel-thrown and glazed in a warm ash finish. Fired in a single batch alongside the rest of the summer collection.',
  images: [] as string[],
  starting_bid: 40,
  current_bid: 72,
  buy_now_price: null,
  listing_type: 'auction',
  sku: 'FIXTURE-001',
  sold_at: null,
  dimensions: { height_in: 11, width_in: 5 },
  techniques: ['wheel-thrown', 'ash glaze'],
  weight: 2.4,
};

const FIXTURE_BIDS = [
  { id: 'bid-1', amount: 72, status: 'confirmed', created_at: new Date('2026-07-08T14:02:00Z'), user_id: 'user-1' },
  { id: 'bid-2', amount: 65, status: 'outbid', created_at: new Date('2026-07-08T09:41:00Z'), user_id: 'user-2' },
  { id: 'bid-3', amount: 55, status: 'outbid', created_at: new Date('2026-07-07T20:15:00Z'), user_id: 'user-3' },
];

const isSold = !!FIXTURE_ITEM.sold_at;
const isAuction = FIXTURE_ITEM.listing_type === 'auction';
const isBuyNow = FIXTURE_ITEM.listing_type === 'buy_now';
const auctionActive = FIXTURE_AUCTION.status === 'active';
const reserveMet =
  !FIXTURE_AUCTION.reserve_price || (FIXTURE_ITEM.current_bid ?? 0) >= FIXTURE_AUCTION.reserve_price;

const columnStyle: React.CSSProperties = {
  flex: '1 1 0',
  minWidth: 0,
  height: '100vh',
  overflowY: 'auto',
  background: 'var(--bg)',
  color: 'var(--ink)',
};

export default function ThemePreviewPage() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div data-theme="receipt" style={columnStyle}>
        <ReceiptPieceDetail
          item={FIXTURE_ITEM}
          auction={FIXTURE_AUCTION}
          bids={FIXTURE_BIDS}
          sku={FIXTURE_ITEM.sku}
          isSold={isSold}
          isReserved={false}
          isAuction={isAuction}
          isBuyNow={isBuyNow}
          auctionActive={auctionActive}
          reserveMet={reserveMet}
          today={new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
        />
      </div>
      <div data-theme="y2k" style={{ ...columnStyle, borderLeft: '4px solid #000' }}>
        <Y2KPieceDetail
          item={{ ...FIXTURE_ITEM, auction: FIXTURE_AUCTION }}
          bids={FIXTURE_BIDS}
          sku={FIXTURE_ITEM.sku}
        />
      </div>
    </div>
  );
}
