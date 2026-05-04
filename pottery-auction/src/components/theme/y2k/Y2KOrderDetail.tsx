'use client';
import Link from 'next/link';
import Win98Window from './Win98Window';

interface Y2KOrderDetailProps {
  order: any;
}

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Y2KOrderDetail({ order }: Y2KOrderDetailProps) {
  const orderItems = order.order_items ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Win98Window
        title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
        icon="/y2k/info-icon.svg"
      >
        {/* Order summary */}
        <table style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, marginBottom: 16, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ color: 'var(--ink-muted)', paddingRight: 16, width: 120 }}>Order ID</td>
              <td style={{ color: 'var(--ink)', fontWeight: 'bold' }}>{order.id.slice(0, 8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--ink-muted)' }}>Date</td>
              <td style={{ color: 'var(--ink)' }}>{formatDate(order.created_at)}</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--ink-muted)' }}>Status</td>
              <td style={{ color: 'var(--ink)', fontWeight: 'bold' }}>{order.status.toUpperCase()}</td>
            </tr>
          </tbody>
        </table>

        {/* Items */}
        {orderItems.length > 0 && (
          <Win98Window title="Items" className="mb-4">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#000080', color: '#ffffff' }}>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>Item</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>SKU</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>Type</th>
                  <th style={{ padding: '3px 6px', textAlign: 'right', border: '1px solid var(--border)' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((oi: any, i: number) => {
                  const item = oi.item;
                  return (
                    <tr key={oi.id} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-well)' }}>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)' }}>
                        <Link href={`/piece/${item?.sku}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                          {item?.title ?? 'ITEM'}
                        </Link>
                      </td>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)', color: 'var(--ink-muted)' }}>
                        {item?.sku}
                      </td>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)', color: 'var(--ink-muted)' }}>
                        {oi.source === 'auction_win' ? 'AUCTION WIN' : 'BUY NOW'}
                      </td>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatCents(oi.price_cents)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Win98Window>
        )}

        {/* Pricing breakdown */}
        <Win98Window title="Price Summary" className="mb-4">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 6px', border: '1px solid var(--border)', color: 'var(--ink-muted)' }}>Subtotal</td>
                <td style={{ padding: '3px 6px', border: '1px solid var(--border)', textAlign: 'right' }}>{formatCents(order.subtotal_cents)}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 6px', border: '1px solid var(--border)', color: 'var(--ink-muted)' }}>Shipping</td>
                <td style={{ padding: '3px 6px', border: '1px solid var(--border)', textAlign: 'right' }}>{formatCents(order.shipping_cents)}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 6px', border: '1px solid var(--border)', color: 'var(--ink-muted)' }}>Tax (NY 8.875%)</td>
                <td style={{ padding: '3px 6px', border: '1px solid var(--border)', textAlign: 'right' }}>{formatCents(order.tax_cents)}</td>
              </tr>
              <tr style={{ background: '#000080', color: '#ffffff' }}>
                <td style={{ padding: '3px 6px', border: '1px solid var(--border)', fontWeight: 'bold' }}>TOTAL</td>
                <td style={{ padding: '3px 6px', border: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold' }}>{formatCents(order.total_cents)}</td>
              </tr>
            </tbody>
          </table>
        </Win98Window>

        {/* Shipping address */}
        {order.shipping_name && (
          <Win98Window title="Ship To" className="mb-4">
            <div style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: 'var(--ink)', lineHeight: 1.6 }}>
              <div>{order.shipping_name}</div>
              <div>{order.shipping_line1}</div>
              {order.shipping_line2 && <div>{order.shipping_line2}</div>}
              <div>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</div>
              <div style={{ textTransform: 'uppercase' }}>{order.shipping_country}</div>
            </div>
          </Win98Window>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/account">
            <button className="win98-btn">← My Account</button>
          </Link>
          <Link href="/browse">
            <button className="win98-btn">Browse More</button>
          </Link>
        </div>
      </Win98Window>
    </div>
  );
}
