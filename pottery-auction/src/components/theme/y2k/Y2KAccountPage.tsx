'use client';
import Link from 'next/link';
import Win98Window from './Win98Window';

interface Y2KAccountPageProps {
  user: { email?: string; created_at: string };
  activeBids: any[];
  wonBids: any[];
  outbidBids: any[];
  orders: any[];
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Y2KAccountPage({ user, activeBids, wonBids, outbidBids, orders }: Y2KAccountPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Win98Window
        title={`My Account — ${user.email ?? 'User'}`}
        icon="/y2k/info-icon.svg"
      >
        {/* Account info */}
        <table style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, marginBottom: 16, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ color: 'var(--ink-muted)', paddingRight: 16, width: 120 }}>Email</td>
              <td style={{ color: 'var(--ink)' }}>{user.email ?? '—'}</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--ink-muted)' }}>Member Since</td>
              <td style={{ color: 'var(--ink)' }}>{formatDate(user.created_at)}</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--ink-muted)' }}>Active Bids</td>
              <td style={{ color: 'var(--ink)' }}>{activeBids.length}</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--ink-muted)' }}>Orders</td>
              <td style={{ color: 'var(--ink)' }}>{orders.length}</td>
            </tr>
          </tbody>
        </table>

        {/* Active bids */}
        {activeBids.length > 0 && (
          <Win98Window title={`Active Bids (${activeBids.length})`} className="mb-4">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#000080', color: '#ffffff' }}>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>Item</th>
                  <th style={{ padding: '3px 6px', textAlign: 'right', border: '1px solid var(--border)' }}>Your Bid</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeBids.map((bid: any, i: number) => {
                  const bidItem = bid.item;
                  return (
                    <tr key={bid.id} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-well)' }}>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)' }}>
                        <Link href={`/piece/${bidItem?.sku}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                          {bidItem?.title ?? bid.item_id}
                        </Link>
                      </td>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatPrice(bid.amount)}
                      </td>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)', color: 'var(--success)' }}>
                        {bid.status.toUpperCase()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Win98Window>
        )}

        {/* Won items */}
        {wonBids.length > 0 && (
          <Win98Window title={`Won Items (${wonBids.length})`} className="mb-4">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#000080', color: '#ffffff' }}>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>Item</th>
                  <th style={{ padding: '3px 6px', textAlign: 'right', border: '1px solid var(--border)' }}>Winning Bid</th>
                </tr>
              </thead>
              <tbody>
                {wonBids.map((bid: any, i: number) => {
                  const bidItem = bid.item;
                  return (
                    <tr key={bid.id} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-well)' }}>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)' }}>
                        <Link href={`/piece/${bidItem?.sku}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                          {bidItem?.title ?? bid.item_id}
                        </Link>
                      </td>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>
                        {formatPrice(bid.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Win98Window>
        )}

        {/* Outbid */}
        {outbidBids.length > 0 && (
          <Win98Window title="Recently Outbid" className="mb-4">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
              <tbody>
                {outbidBids.map((bid: any, i: number) => {
                  const bidItem = bid.item;
                  return (
                    <tr key={bid.id} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-well)' }}>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)' }}>
                        <Link href={`/piece/${bidItem?.sku}`} style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>
                          {bidItem?.title ?? bid.item_id}
                        </Link>
                      </td>
                      <td style={{ padding: '3px 6px', border: '1px solid var(--border)', textAlign: 'right', color: 'var(--error)' }}>
                        {formatPrice(bid.amount)} — OUTBID
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Win98Window>
        )}

        {/* Orders */}
        <Win98Window title="Order History" className="mb-4">
          {orders.length === 0 ? (
            <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: 'var(--ink-muted)', textAlign: 'center', padding: '8px 0' }}>
              No orders yet.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#000080', color: '#ffffff' }}>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>Order ID</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>Date</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>Status</th>
                  <th style={{ padding: '3px 6px', textAlign: 'right', border: '1px solid var(--border)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any, i: number) => (
                  <tr key={order.id} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-well)' }}>
                    <td style={{ padding: '3px 6px', border: '1px solid var(--border)' }}>
                      <Link href={`/account/orders/${order.id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        {order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td style={{ padding: '3px 6px', border: '1px solid var(--border)', color: 'var(--ink-muted)' }}>
                      {formatDate(order.created_at)}
                    </td>
                    <td style={{ padding: '3px 6px', border: '1px solid var(--border)' }}>
                      {order.status.toUpperCase()}
                    </td>
                    <td style={{ padding: '3px 6px', border: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold' }}>
                      {formatCents(order.total_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Win98Window>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/browse">
            <button className="win98-btn">Browse More</button>
          </Link>
        </div>
      </Win98Window>
    </div>
  );
}
