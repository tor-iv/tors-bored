-- Pottery Auction Marketplace - Supabase Database Schema
-- Run this in Supabase Dashboard > SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auctions table
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'ended')),
  featured_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table (pottery pieces)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  starting_bid DECIMAL(10,2) NOT NULL,
  current_bid DECIMAL(10,2) DEFAULT 0,
  highest_bidder UUID REFERENCES profiles(id),
  dimensions JSONB, -- {height, width, depth}
  techniques TEXT[] DEFAULT '{}',
  weight DECIMAL(8,2),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'outbid', 'won')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commissions table
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  budget DECIMAL(10,2),
  timeline TEXT,
  status TEXT NOT NULL CHECK (status IN ('submitted', 'reviewing', 'accepted', 'declined', 'in_progress', 'completed')),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_items_auction_id ON items(auction_id);
CREATE INDEX idx_items_featured ON items(featured) WHERE featured = TRUE;
CREATE INDEX idx_bids_item_id ON bids(item_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_commissions_user_id ON commissions(user_id);
CREATE INDEX idx_commissions_status ON commissions(status);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- AUCTIONS POLICIES (Public read, Admin write)
-- =====================================================

CREATE POLICY "Auctions are viewable by everyone"
  ON auctions FOR SELECT USING (true);

CREATE POLICY "Admins can insert auctions"
  ON auctions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update auctions"
  ON auctions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete auctions"
  ON auctions FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =====================================================
-- ITEMS POLICIES (Public read, Admin write)
-- =====================================================

CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT USING (true);

CREATE POLICY "Admins can insert items"
  ON items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update items"
  ON items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete items"
  ON items FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =====================================================
-- BIDS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own bids"
  ON bids FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bids"
  ON bids FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Authenticated users can place bids"
  ON bids FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- COMMISSIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own commissions"
  ON commissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all commissions"
  ON commissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Authenticated users can submit commissions"
  ON commissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update commissions"
  ON commissions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =====================================================
-- TRIGGER TO AUTO-CREATE PROFILE ON USER SIGNUP
-- Automatically sets vcox484@gmail.com as admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    -- Auto-set admin for the primary admin email
    CASE WHEN NEW.email = 'vcox484@gmail.com' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STORAGE BUCKETS FOR IMAGES
-- =====================================================

-- Create storage buckets (run in Supabase Dashboard > Storage)
-- Or use SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('pottery-images', 'pottery-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('commission-images', 'commission-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pottery-images bucket
CREATE POLICY "Anyone can view pottery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pottery-images');

CREATE POLICY "Admins can upload pottery images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pottery-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update pottery images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pottery-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete pottery images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pottery-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Storage policies for commission-images bucket
CREATE POLICY "Anyone can view commission images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'commission-images');

CREATE POLICY "Authenticated users can upload commission images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'commission-images'
    AND auth.role() = 'authenticated'
  );

-- =====================================================
-- ADMIN EMAIL CONFIGURATION
-- =====================================================

-- If user already exists, update them to admin:
-- UPDATE profiles SET is_admin = true WHERE email = 'vcox484@gmail.com';

-- =====================================================
-- DONE! Schema created successfully
-- =====================================================
