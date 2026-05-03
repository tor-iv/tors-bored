-- Migration: 0001_overhaul
-- Adds all columns and tables required for the three-theme pottery auction overhaul

BEGIN;

-- ================================================
-- ITEMS: listing type, pricing, SKU
-- ================================================

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'auction'
    CHECK (listing_type IN ('auction', 'buy_now')),
  ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS reserve_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS buy_now_price DECIMAL(10,2);

-- ================================================
-- AUCTIONS: soft-close configuration
-- ================================================

ALTER TABLE auctions
  ADD COLUMN IF NOT EXISTS soft_close_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS soft_close_extension_minutes INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS soft_close_window_minutes INT DEFAULT 2,
  ADD COLUMN IF NOT EXISTS extended_end_date TIMESTAMPTZ;

-- ================================================
-- PROFILES: theme preference
-- ================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS theme_preference TEXT
    CHECK (theme_preference IN ('handdrawn', 'y2k', 'receipt'));

-- ================================================
-- WATCHLIST
-- ================================================

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- ================================================
-- ORDERS
-- ================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  total_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  -- Shipping address
  shipping_name TEXT,
  shipping_line1 TEXT,
  shipping_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ORDER ITEMS
-- ================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  price_cents INT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('buy_now', 'auction_win')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- BID PAYMENT INTENTS (one per user per auction)
-- ================================================

CREATE TABLE IF NOT EXISTS bid_payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL,
  current_amount_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requires_payment_method'
    CHECK (status IN ('requires_payment_method', 'requires_confirmation', 'requires_capture', 'succeeded', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, auction_id)
);

-- ================================================
-- SKU TYPE CODES LOOKUP
-- ================================================

CREATE TABLE IF NOT EXISTS sku_type_codes (
  type_code TEXT PRIMARY KEY,
  item_type TEXT NOT NULL
);

INSERT INTO sku_type_codes (type_code, item_type) VALUES
  ('MUG', 'mug'),
  ('BWL', 'bowl'),
  ('VAS', 'vase'),
  ('PLT', 'plate'),
  ('JUG', 'jug'),
  ('CUP', 'cup'),
  ('POT', 'pot'),
  ('OBJ', 'object')
ON CONFLICT DO NOTHING;

-- ================================================
-- SKU GENERATOR FUNCTION
-- ================================================

CREATE OR REPLACE FUNCTION generate_sku(p_type_code TEXT)
RETURNS TEXT AS $$
DECLARE
  v_year INT;
  v_count INT;
  v_sku TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::INT;

  SELECT COUNT(*) + 1 INTO v_count
  FROM items
  WHERE sku LIKE (p_type_code || '-' || v_year || '-%');

  v_sku := p_type_code || '-' || v_year || '-' || LPAD(v_count::TEXT, 3, '0');
  RETURN v_sku;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- AUCTION CLOSE CHECK FUNCTION (called by pg_cron)
-- ================================================

CREATE OR REPLACE FUNCTION close_ended_auctions()
RETURNS VOID AS $$
DECLARE
  v_auction RECORD;
  v_winning_bid RECORD;
BEGIN
  FOR v_auction IN
    SELECT a.id, a.extended_end_date, a.end_date, a.reserve_price
    FROM auctions a
    WHERE a.status = 'active'
      AND COALESCE(a.extended_end_date, a.end_date) < NOW()
  LOOP
    -- Find highest confirmed bid
    SELECT b.id, b.user_id, b.amount, bpi.stripe_payment_intent_id
    INTO v_winning_bid
    FROM bids b
    LEFT JOIN bid_payment_intents bpi ON bpi.user_id = b.user_id AND bpi.auction_id = b.auction_id
    WHERE b.auction_id = v_auction.id
      AND b.status IN ('pending', 'confirmed')
    ORDER BY b.amount DESC
    LIMIT 1;

    -- Mark auction ended
    UPDATE auctions SET status = 'ended' WHERE id = v_auction.id;

    IF v_winning_bid.id IS NOT NULL THEN
      IF v_auction.reserve_price IS NULL OR v_winning_bid.amount >= v_auction.reserve_price THEN
        -- Mark winning bid
        UPDATE bids SET status = 'won' WHERE id = v_winning_bid.id;
        -- Mark all other bids as outbid (final)
        UPDATE bids SET status = 'outbid'
        WHERE auction_id = v_auction.id AND id != v_winning_bid.id;
        -- Flag auction for Stripe capture (the API route handles actual capture)
        UPDATE auctions SET status = 'ended' WHERE id = v_auction.id;
        -- Note: capture is triggered by the /api/auctions/close-check route which is polled
      ELSE
        -- Reserve not met — cancel all bids
        UPDATE bids SET status = 'outbid' WHERE auction_id = v_auction.id;
        UPDATE auctions SET status = 'ended' WHERE id = v_auction.id;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- pg_cron JOB (requires pg_cron extension enabled in Supabase dashboard)
-- Enable via: Extensions > pg_cron in Supabase dashboard first
-- ================================================

-- SELECT cron.schedule('close-ended-auctions', '* * * * *', $$ SELECT close_ended_auctions() $$);
-- Note: uncomment the above after enabling pg_cron extension in Supabase dashboard

-- ================================================
-- ROW-LEVEL SECURITY
-- ================================================

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_payment_intents ENABLE ROW LEVEL SECURITY;

-- Watchlist: users see/manage their own
CREATE POLICY "watchlist_own" ON watchlist
  FOR ALL USING (auth.uid() = user_id);

-- Orders: users see their own; admins see all
CREATE POLICY "orders_own" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Order items: follow parent order visibility
CREATE POLICY "order_items_own" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND (
        o.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
      )
    )
  );

-- Bid payment intents: users see their own; system can write
CREATE POLICY "bid_pi_own" ON bid_payment_intents
  FOR SELECT USING (auth.uid() = user_id);

-- ================================================
-- BACKFILL SKUs for existing items (OBJ type for unknowns)
-- ================================================

UPDATE items
SET sku = generate_sku('OBJ')
WHERE sku IS NULL;

COMMIT;
