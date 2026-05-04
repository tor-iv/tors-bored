-- Migration: 0002_buy_now_reservations
-- Adds inventory reservation columns, order breakdown columns, webhook
-- idempotency table, and atomic reservation/payment-fulfillment functions.

BEGIN;

-- ================================================
-- ITEMS: reservation TTL for 1-of-1 inventory
-- ================================================

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reserved_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reserved_order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS items_reserved_until_idx ON items(reserved_until)
  WHERE reserved_until IS NOT NULL;

-- ================================================
-- ORDERS: per-line cost breakdown
-- ================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS subtotal_cents INT,
  ADD COLUMN IF NOT EXISTS shipping_cents INT,
  ADD COLUMN IF NOT EXISTS tax_cents INT;

-- ================================================
-- STRIPE EVENTS: webhook idempotency deduplication
-- ================================================

CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- try_reserve_item: atomic TTL lock for buy-now
--
-- Returns TRUE if the lock was acquired, FALSE if the item is
-- already reserved by a DIFFERENT order.  Re-calling with the
-- SAME order_id extends the TTL (idempotent retry path).
-- ================================================

CREATE OR REPLACE FUNCTION try_reserve_item(
  p_item_id      UUID,
  p_order_id     UUID,
  p_ttl_minutes  INT DEFAULT 15
) RETURNS BOOLEAN AS $$
DECLARE
  v_rows INT;
BEGIN
  UPDATE items
     SET reserved_until    = NOW() + (p_ttl_minutes || ' minutes')::INTERVAL,
         reserved_order_id = p_order_id
   WHERE id               = p_item_id
     AND listing_type     = 'buy_now'
     AND sold_at          IS NULL
     AND (
           reserved_until    IS NULL
        OR reserved_until    < NOW()
        OR reserved_order_id = p_order_id  -- same order: extend TTL
     );

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- mark_order_paid: called from payment_intent.succeeded webhook
--
-- Idempotent: WHERE status='pending' means re-delivery is a no-op.
-- ================================================

CREATE OR REPLACE FUNCTION mark_order_paid(p_order_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE orders
     SET status     = 'paid',
         updated_at = NOW()
   WHERE id     = p_order_id
     AND status = 'pending';

  UPDATE items i
     SET sold_at           = NOW(),
         reserved_until    = NULL,
         reserved_order_id = NULL
    FROM order_items oi
   WHERE oi.order_id = p_order_id
     AND oi.item_id  = i.id
     AND i.sold_at   IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- mark_order_cancelled: called from payment_intent.payment_failed / .canceled
-- ================================================

CREATE OR REPLACE FUNCTION mark_order_cancelled(p_order_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE orders
     SET status     = 'cancelled',
         updated_at = NOW()
   WHERE id     = p_order_id
     AND status = 'pending';

  UPDATE items i
     SET reserved_until    = NULL,
         reserved_order_id = NULL
    FROM order_items oi
   WHERE oi.order_id = p_order_id
     AND oi.item_id  = i.id
     AND i.sold_at   IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
