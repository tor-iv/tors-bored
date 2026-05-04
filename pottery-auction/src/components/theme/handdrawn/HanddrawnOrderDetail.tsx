'use client';

import Link from 'next/link';
import RoughBorder from './RoughBorder';

interface HanddrawnOrderDetailProps {
  order: any;
}

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

const statusMessages: Record<string, { heading: string; body: string }> = {
  paid:      { heading: 'Processing your order', body: "We'll email you when your piece ships." },
  shipped:   { heading: 'Your piece is on its way', body: 'Tracking information will be sent to your email.' },
  delivered: { heading: 'Delivered!', body: 'Enjoy your handmade piece.' },
  cancelled: { heading: 'Order cancelled', body: 'If you have questions, please reach out.' },
  pending:   { heading: 'Payment pending', body: 'Your payment is being processed.' },
};

export default function HanddrawnOrderDetail({ order }: HanddrawnOrderDetailProps) {
  const orderItems = order.order_items ?? [];
  const statusMsg = statusMessages[order.status] ?? { heading: order.status.toUpperCase(), body: '' };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: 'var(--ink-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
        }}
      >
        Order #{order.id.slice(0, 8).toUpperCase()}
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '2rem',
        }}
      >
        Order Detail
      </h1>

      {/* Status */}
      <div style={{ marginBottom: '2rem' }}>
        <RoughBorder roughness={1.3} strokeWidth={1.5}>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-well)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: order.status === 'cancelled' ? 'var(--error)' : 'var(--ink)',
                marginBottom: '0.25rem',
              }}
            >
              {statusMsg.heading}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.875rem' }}>
              {statusMsg.body}
            </p>
          </div>
        </RoughBorder>
      </div>

      {/* Items */}
      {orderItems.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: 'var(--ink)',
              marginBottom: '1rem',
            }}
          >
            Items
          </h2>
          {orderItems.map((oi: any) => {
            const item = oi.item;
            return (
              <div key={oi.id} style={{ marginBottom: '0.75rem' }}>
                <RoughBorder roughness={1.2} strokeWidth={1.5}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-well)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <Link
                        href={`/piece/${item?.sku}`}
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.125rem',
                          color: 'var(--ink)',
                          textDecoration: 'none',
                          display: 'block',
                        }}
                      >
                        {item?.title ?? 'Item'}
                      </Link>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.75rem',
                          color: 'var(--ink-muted)',
                        }}
                      >
                        {item?.sku} · {oi.source === 'auction_win' ? 'Auction Win' : 'Buy Now'}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--accent)',
                      }}
                    >
                      {formatCents(oi.price_cents)}
                    </div>
                  </div>
                </RoughBorder>
              </div>
            );
          })}
        </section>
      )}

      {/* Pricing breakdown */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            color: 'var(--ink)',
            marginBottom: '1rem',
          }}
        >
          Total
        </h2>
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '0.75rem',
          }}
        >
          {[
            { label: 'Subtotal', value: formatCents(order.subtotal_cents) },
            { label: 'Shipping', value: formatCents(order.shipping_cents) },
            { label: 'Tax', value: formatCents(order.tax_cents) },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: 'var(--ink-muted)',
                marginBottom: '0.25rem',
              }}
            >
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--ink)',
              borderTop: '1px solid var(--border)',
              paddingTop: '0.5rem',
              marginTop: '0.5rem',
            }}
          >
            <span>Total</span>
            <span>{formatCents(order.total_cents)}</span>
          </div>
        </div>
      </section>

      {/* Shipping address */}
      {order.shipping_name && (
        <section style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: 'var(--ink)',
              marginBottom: '1rem',
            }}
          >
            Ship To
          </h2>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--ink)',
              lineHeight: 1.7,
            }}
          >
            <div>{order.shipping_name}</div>
            <div>{order.shipping_line1}</div>
            {order.shipping_line2 && <div>{order.shipping_line2}</div>}
            <div>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</div>
            <div style={{ textTransform: 'uppercase' }}>{order.shipping_country}</div>
          </div>
        </section>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          href="/account"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            border: '2px solid var(--accent)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            textDecoration: 'none',
          }}
        >
          My Account
        </Link>
        <Link
          href="/browse"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            border: '2px solid var(--border)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            textDecoration: 'none',
          }}
        >
          Browse More
        </Link>
      </div>
    </div>
  );
}
