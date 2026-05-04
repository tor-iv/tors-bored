'use client';
import { useRouter } from 'next/navigation';
import BlinkingClock from './BlinkingClock';

interface BrowseItem {
  id: string;
  sku: string;
  title: string;
  listingType: 'auction' | 'buy_now';
  buyNowPrice?: number | null;
  currentBid?: number | null;
  startingBid?: number | null;
  endDate?: string | null;
  soldAt?: string | null;
  techniques?: string[];
  images?: string[];
}

interface Y2KBrowseLayoutProps {
  items: BrowseItem[];
  heading: string;
  emptyMessage?: string;
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

export default function Y2KBrowseLayout({ items, heading, emptyMessage }: Y2KBrowseLayoutProps) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 style={{ fontFamily: '"Comic Sans MS", cursive', color: 'var(--ink)', fontSize: '1.5rem', marginBottom: '1rem' }}>
        {heading}
      </h1>
      {items.length === 0 ? (
        <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: 'var(--ink-muted)' }}>
          {emptyMessage ?? 'No items found.'}
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
          <thead>
            <tr style={{ background: '#000080', color: '#ffffff' }}>
              <th style={{ padding: '4px 8px', textAlign: 'left', border: '1px solid var(--border)' }}>ITEM</th>
              <th style={{ padding: '4px 8px', textAlign: 'left', border: '1px solid var(--border)' }}>CURRENT BID/PRICE</th>
              <th style={{ padding: '4px 8px', textAlign: 'left', border: '1px solid var(--border)' }}>TIME LEFT</th>
              <th style={{ padding: '4px 8px', textAlign: 'left', border: '1px solid var(--border)' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item.id}
                style={{
                  background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-well)',
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/piece/${item.sku}`)}
                tabIndex={0}
                role="button"
                aria-label={`View ${item.title}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/piece/${item.sku}`); } }}
              >
                <td style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        width="40"
                        height="40"
                        style={{ border: '1px solid var(--border)', objectFit: 'cover', flexShrink: 0 }}
                        alt=""
                      />
                    )}
                    <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{item.title}</span>
                  </div>
                </td>
                <td style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>
                  {item.listingType === 'auction'
                    ? formatPrice(item.currentBid ?? item.startingBid)
                    : formatPrice(item.buyNowPrice)}
                </td>
                <td style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>
                  {item.endDate ? <BlinkingClock endDate={item.endDate} /> : '—'}
                </td>
                <td style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>
                  {item.soldAt ? 'SOLD' : item.listingType === 'auction' ? 'ACTIVE' : 'BUY NOW'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
