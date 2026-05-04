'use client';

import Link from 'next/link';
import RoughBorder from './RoughBorder';

interface HanddrawnAccountPageProps {
  user: { email?: string | null };
  activeBids: any[];
  orders: any[];
  wonBids: any[];
  outbidBids: any[];
}

export default function HanddrawnAccountPage({
  user,
  activeBids,
  orders,
  wonBids,
  outbidBids,
}: HanddrawnAccountPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '0.5rem',
        }}
      >
        My Account
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--ink-muted)',
          marginBottom: '2rem',
        }}
      >
        {user.email}
      </p>

      {/* Active bids section */}
      {activeBids.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              color: 'var(--ink)',
              marginBottom: '1rem',
            }}
          >
            Active Bids ({activeBids.length})
          </h2>
          {activeBids.map((bid: any) => (
            <div key={bid.id} style={{ marginBottom: '0.75rem' }}>
              <RoughBorder roughness={1.2} strokeWidth={1.5}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-well)' }}>
                  <Link
                    href={`/piece/${bid.item?.sku}`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      color: 'var(--ink)',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {bid.item?.title ?? bid.item_id}
                  </Link>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.5rem',
                      color: 'var(--accent)',
                      fontWeight: 700,
                    }}
                  >
                    ${Number(bid.amount).toFixed(2)}
                  </div>
                </div>
              </RoughBorder>
            </div>
          ))}
        </section>
      )}

      {/* Won items */}
      {wonBids.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              color: 'var(--ink)',
              marginBottom: '1rem',
            }}
          >
            Won Items ({wonBids.length})
          </h2>
          {wonBids.map((bid: any) => (
            <div key={bid.id} style={{ marginBottom: '0.75rem' }}>
              <RoughBorder roughness={1.2} strokeWidth={1.5}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-well)' }}>
                  <Link
                    href={`/piece/${bid.item?.sku}`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      color: 'var(--ink)',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {bid.item?.title ?? bid.item_id}
                  </Link>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      color: 'var(--success)',
                    }}
                  >
                    Won — ${Number(bid.amount).toFixed(2)}
                  </div>
                </div>
              </RoughBorder>
            </div>
          ))}
        </section>
      )}

      {/* Orders section */}
      {orders.length > 0 && (
        <section>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              color: 'var(--ink)',
              marginBottom: '1rem',
            }}
          >
            Order History
          </h2>
          {orders.map((order: any) => (
            <div key={order.id} style={{ marginBottom: '0.75rem' }}>
              <Link
                href={`/account/orders/${order.id}`}
                className="block hover:opacity-80"
                style={{ textDecoration: 'none' }}
              >
                <RoughBorder roughness={1.2} strokeWidth={1.5}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-well)' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        color: 'var(--ink)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Order #{order.id.slice(0, 8).toUpperCase()} — {order.status.toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        color: 'var(--ink-muted)',
                      }}
                    >
                      ${(order.total_cents / 100).toFixed(2)}
                    </div>
                  </div>
                </RoughBorder>
              </Link>
            </div>
          ))}
        </section>
      )}

      {activeBids.length === 0 && orders.length === 0 && wonBids.length === 0 && (
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>
          No activity yet. Browse some pieces!
        </p>
      )}
    </div>
  );
}
