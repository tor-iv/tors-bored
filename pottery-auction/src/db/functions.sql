-- ──────────────────────────────────────────────────────────────────────────
-- PL/pgSQL functions for Tor's Bored, reconciled for plain Postgres 16.
-- Applied by src/db/migrate.ts AFTER drizzle-kit's table migrations.
-- (Drizzle schema can't express PL/pgSQL, so these live here.)
--
-- Changes from the old Supabase versions:
--   * uuid_generate_v4()  -> gen_random_uuid() is unused here (tables own it).
--   * Removed pg_cron scheduling (the Hetzner host crontab drives close-check).
--   * close_ended_auctions() rewritten to determine a winner PER ITEM (each
--     pottery piece is its own lot), not one winner for the whole auction.
--   * FOR UPDATE SKIP LOCKED so overlapping cron ticks can't double-process.
-- ──────────────────────────────────────────────────────────────────────────

-- Seed SKU type codes (idempotent).
INSERT INTO sku_type_codes (type_code, item_type) VALUES
  ('MUG', 'mug'), ('BWL', 'bowl'), ('VAS', 'vase'), ('PLT', 'plate'),
  ('JUG', 'jug'), ('CUP', 'cup'), ('POT', 'pot'), ('OBJ', 'object')
ON CONFLICT DO NOTHING;

-- generate_sku('VAS') -> 'VAS-2026-001'
CREATE OR REPLACE FUNCTION generate_sku(p_type_code TEXT)
RETURNS TEXT AS $$
DECLARE
  v_year INT;
  v_count INT;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::INT;
  SELECT COUNT(*) + 1 INTO v_count
  FROM items
  WHERE sku LIKE (p_type_code || '-' || v_year || '-%');
  RETURN p_type_code || '-' || v_year || '-' || LPAD(v_count::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Atomic TTL lock for buy-now inventory (1-of-1 pottery). TRUE if acquired.
-- Re-calling with the same order_id extends the TTL (idempotent retry).
CREATE OR REPLACE FUNCTION try_reserve_item(
  p_item_id     UUID,
  p_order_id    UUID,
  p_ttl_minutes INT DEFAULT 15
) RETURNS BOOLEAN AS $$
DECLARE
  v_rows INT;
BEGIN
  UPDATE items
     SET reserved_until    = NOW() + (p_ttl_minutes || ' minutes')::INTERVAL,
         reserved_order_id = p_order_id
   WHERE id           = p_item_id
     AND listing_type = 'buy_now'
     AND sold_at      IS NULL
     AND (
           reserved_until    IS NULL
        OR reserved_until    < NOW()
        OR reserved_order_id = p_order_id
     );
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Buy-now fulfillment from payment_intent.succeeded (idempotent on status).
CREATE OR REPLACE FUNCTION mark_order_paid(p_order_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE orders SET status = 'paid', updated_at = NOW()
   WHERE id = p_order_id AND status = 'pending';

  UPDATE items i
     SET sold_at = NOW(), reserved_until = NULL, reserved_order_id = NULL
    FROM order_items oi
   WHERE oi.order_id = p_order_id AND oi.item_id = i.id AND i.sold_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Buy-now reversal from payment_intent.payment_failed / .canceled.
CREATE OR REPLACE FUNCTION mark_order_cancelled(p_order_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE orders SET status = 'cancelled', updated_at = NOW()
   WHERE id = p_order_id AND status = 'pending';

  UPDATE items i
     SET reserved_until = NULL, reserved_order_id = NULL
    FROM order_items oi
   WHERE oi.order_id = p_order_id AND oi.item_id = i.id AND i.sold_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Close auctions whose (extended) end time has passed: mark the auction 'ended'
-- and, PER ITEM, mark the highest qualifying bid 'won' and the rest 'outbid'.
-- Charging the winners is done by the TS cron route (/api/cron/close-check),
-- keyed off bids in 'won' status. Reserve is enforced per item.
CREATE OR REPLACE FUNCTION close_ended_auctions() RETURNS VOID AS $$
DECLARE
  v_auction RECORD;
  v_item    RECORD;
  v_win     RECORD;
BEGIN
  FOR v_auction IN
    SELECT id FROM auctions
     WHERE status = 'active'
       AND COALESCE(extended_end_date, end_date) < NOW()
     FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE auctions SET status = 'ended', updated_at = NOW() WHERE id = v_auction.id;

    FOR v_item IN
      SELECT id, reserve_price FROM items
       WHERE auction_id = v_auction.id AND listing_type = 'auction'
    LOOP
      SELECT b.id, b.user_id, b.amount INTO v_win
        FROM bids b
       WHERE b.item_id = v_item.id AND b.status IN ('pending', 'confirmed')
       ORDER BY b.amount DESC, b.created_at ASC
       LIMIT 1;

      IF v_win.id IS NOT NULL
         AND (v_item.reserve_price IS NULL OR v_win.amount >= v_item.reserve_price) THEN
        UPDATE bids SET status = 'won' WHERE id = v_win.id;
        UPDATE bids SET status = 'outbid'
         WHERE item_id = v_item.id AND id <> v_win.id AND status IN ('pending', 'confirmed');
      ELSE
        UPDATE bids SET status = 'outbid'
         WHERE item_id = v_item.id AND status IN ('pending', 'confirmed');
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
