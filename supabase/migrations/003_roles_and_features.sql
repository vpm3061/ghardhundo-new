-- Migration 003: Roles, offers, subscriptions, packages, coin conversions, donated listings
-- Safe to run via Supabase SQL Editor

-- ── Profile role ──────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'buyer';

-- ── New property columns ──────────────────────────────────────────────────
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_plan TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS tags TEXT[];

-- ── Commission extra tracking ─────────────────────────────────────────────
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS commission_percent NUMERIC;
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS deal_date DATE;
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS payment_date DATE;

-- ── Offers (per-property special offers with expiry) ──────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  description   TEXT,
  valid_till    DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads offers"    ON offers;
DROP POLICY IF EXISTS "Admin manages offers"   ON offers;
CREATE POLICY "Anyone reads offers"  ON offers FOR SELECT USING (true);
CREATE POLICY "Admin manages offers" ON offers FOR ALL TO authenticated
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- ── Dealer subscriptions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dealer_subscriptions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan         TEXT        NOT NULL,
  amount       NUMERIC,
  leads_limit  INT         NOT NULL DEFAULT 5,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ,
  status       TEXT        NOT NULL DEFAULT 'Active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE dealer_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dealer sees own sub"   ON dealer_subscriptions;
DROP POLICY IF EXISTS "Admin manages subs"    ON dealer_subscriptions;
CREATE POLICY "Dealer sees own sub" ON dealer_subscriptions FOR SELECT TO authenticated
  USING (dealer_id = auth.uid());
CREATE POLICY "Admin manages subs"  ON dealer_subscriptions FOR ALL TO authenticated
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- ── Builder packages ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS builder_packages (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan          TEXT        NOT NULL DEFAULT 'Basic',
  amount        NUMERIC     NOT NULL DEFAULT 0,
  listing_limit INT         NOT NULL DEFAULT 2,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ,
  status        TEXT        NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE builder_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Builder sees own pkg"  ON builder_packages;
DROP POLICY IF EXISTS "Admin manages pkgs"    ON builder_packages;
CREATE POLICY "Builder sees own pkg" ON builder_packages FOR SELECT TO authenticated
  USING (builder_id = auth.uid());
CREATE POLICY "Admin manages pkgs"   ON builder_packages FOR ALL TO authenticated
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- ── Coin conversions (cash-out requests) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS coin_conversions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coins       INT         NOT NULL,
  cash_amount NUMERIC     NOT NULL,
  upi_id      TEXT,
  status      TEXT        NOT NULL DEFAULT 'Pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE coin_conversions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User sees own conversions"    ON coin_conversions;
DROP POLICY IF EXISTS "User inserts conversions"     ON coin_conversions;
DROP POLICY IF EXISTS "Admin manages conversions"    ON coin_conversions;
CREATE POLICY "User sees own conversions" ON coin_conversions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "User inserts conversions"  ON coin_conversions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin manages conversions" ON coin_conversions FOR ALL TO authenticated
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- ── Donated listings (user-submitted, earns coins on approval) ────────────
CREATE TABLE IF NOT EXISTS donated_listings (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  title          TEXT        NOT NULL,
  builder        TEXT,
  sector         TEXT,
  city           TEXT,
  price_min      NUMERIC,
  price_max      NUMERIC,
  bhk            TEXT[],
  description    TEXT,
  contact_phone  TEXT,
  status         TEXT        NOT NULL DEFAULT 'Pending',
  coins_awarded  BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE donated_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User sees own donations"   ON donated_listings;
DROP POLICY IF EXISTS "User inserts donations"    ON donated_listings;
DROP POLICY IF EXISTS "Admin manages donations"   ON donated_listings;
CREATE POLICY "User sees own donations"  ON donated_listings FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "User inserts donations"   ON donated_listings FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin manages donations"  ON donated_listings FOR ALL TO authenticated
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- ── Storage bucket hint (create manually in Supabase dashboard) ───────────
-- Bucket name : property-photos
-- Public      : true
-- File size   : 10 MB max
-- MIME types  : image/jpeg, image/png, image/webp
