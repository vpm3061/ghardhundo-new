-- ─────────────────────────────────────────────
-- GharDhundo Migration 004: saved, views, payments
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────

-- 1. Saved properties (user favourites)
CREATE TABLE IF NOT EXISTS saved_properties (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner access" ON saved_properties FOR ALL USING (auth.uid() = user_id);

-- 2. Property views tracking
CREATE TABLE IF NOT EXISTS property_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insert views"     ON property_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read views" ON property_views FOR SELECT USING (true);

-- 3. Payment orders (Razorpay records)
CREATE TABLE IF NOT EXISTS payment_orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  plan                 TEXT NOT NULL,
  role                 TEXT NOT NULL,
  amount               NUMERIC NOT NULL,
  currency             TEXT DEFAULT 'INR',
  status               TEXT NOT NULL DEFAULT 'created',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner read"   ON payment_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner insert" ON payment_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update" ON payment_orders FOR UPDATE USING (auth.uid() = user_id);

-- 4. dealer_lead_purchases (track individual lead reveals)
CREATE TABLE IF NOT EXISTS dealer_lead_purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES dealer_subscriptions(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(dealer_id, lead_id)
);
ALTER TABLE dealer_lead_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dealer access" ON dealer_lead_purchases FOR ALL USING (auth.uid() = dealer_id);

-- 5. Add leads_used to dealer_subscriptions
ALTER TABLE dealer_subscriptions ADD COLUMN IF NOT EXISTS leads_used INT NOT NULL DEFAULT 0;

-- 6. Add referral_code to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins INT NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_idx ON profiles(referral_code) WHERE referral_code IS NOT NULL;

-- 7. coin_transactions (replaces/augments 'coins' table going forward)
CREATE TABLE IF NOT EXISTS coin_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount      INT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('earned','spent','converted')),
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner read"   ON coin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System write" ON coin_transactions FOR INSERT WITH CHECK (true);

-- 8. listed_by column on properties (builder's user ID)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listed_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS views_count INT NOT NULL DEFAULT 0;

-- NOTE: Create storage bucket 'property-photos' in Supabase Dashboard → Storage
-- (Public, 10MB limit, image/jpeg + image/png + image/webp MIME types)
