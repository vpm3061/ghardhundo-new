-- Migration 005: Orenzaa rebuild — CPL/listings/subscriptions/banners model
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/angokuzvthqzezdnpptf/sql
-- Safe to re-run (IF NOT EXISTS guards throughout, since some columns/tables
-- may already exist live from earlier ad-hoc changes not captured in migrations).

-- ── Profiles: expert registration + partner flag ───────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_partner BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expert_registered BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registration_paid_at TIMESTAMPTZ;

-- ── Properties: formalize drifted columns ───────────────────────────────────
ALTER TABLE properties ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_type TEXT;          -- 'builder' | 'expert' | legacy 'owner'
ALTER TABLE properties ADD COLUMN IF NOT EXISTS possession_date DATE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_contact TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS locality TEXT;              -- new name going forward; `sector` kept for back-compat

UPDATE properties SET locality = sector WHERE locality IS NULL AND sector IS NOT NULL;
UPDATE properties SET created_by = listed_by WHERE created_by IS NULL AND listed_by IS NOT NULL;

-- ── Properties: property_category (distinct from listing_type) ─────────────
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_category TEXT NOT NULL DEFAULT 'flat';
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_category_check;
ALTER TABLE properties ADD CONSTRAINT properties_property_category_check
  CHECK (property_category IN ('flat','plot','rental','commercial'));

-- ── Properties: contact preference ──────────────────────────────────────────
ALTER TABLE properties ADD COLUMN IF NOT EXISTS contact_preference TEXT NOT NULL DEFAULT 'both';
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_contact_preference_check;
ALTER TABLE properties ADD CONSTRAINT properties_contact_preference_check
  CHECK (contact_preference IN ('call','whatsapp','both'));

-- ── Properties: plot fields ──────────────────────────────────────────────────
ALTER TABLE properties ADD COLUMN IF NOT EXISTS plot_area_sqyard NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS plot_type TEXT;             -- 'Residential' | 'Commercial' | 'Agricultural'
ALTER TABLE properties ADD COLUMN IF NOT EXISTS corner_plot BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS facing TEXT;                -- 'North' | 'South' | 'East' | 'West'
ALTER TABLE properties ADD COLUMN IF NOT EXISTS registry_done BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS boundary_wall BOOLEAN NOT NULL DEFAULT false;

-- ── Properties: rental fields ─────────────────────────────────────────────────
ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_rent NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deposit_months INT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS tenant_preference TEXT;     -- 'Family' | 'Bachelor' | 'Any'
ALTER TABLE properties ADD COLUMN IF NOT EXISTS gender_preference TEXT;     -- 'Any' | 'Male' | 'Female'
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN NOT NULL DEFAULT false;

-- ── Properties: commercial fields ─────────────────────────────────────────────
ALTER TABLE properties ADD COLUMN IF NOT EXISTS commercial_type TEXT;       -- 'Shop' | 'Office' | 'Showroom' | 'Warehouse' | 'Garage'

-- ── Properties: shared "furnished" + "parking" + "power_load" + "frontage_width"
-- used across flat/rental/commercial forms
ALTER TABLE properties ADD COLUMN IF NOT EXISTS furnished TEXT;             -- 'Furnished' | 'Semi' | 'Unfurnished'
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS power_load TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS frontage_width NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_number INT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_floors INT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS super_area NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS carpet_area NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS age_years INT;

-- ── Properties: fix missing owner-write RLS (drift fix) ─────────────────────
-- Builder/Owner forms already insert directly as the logged-in user, but no
-- migration ever granted authenticated non-admin users write access — this
-- policy must exist live but untracked. Formalizing it here.
DROP POLICY IF EXISTS "Owners manage own properties" ON properties;
CREATE POLICY "Owners manage own properties" ON properties FOR ALL TO authenticated
  USING     (created_by = auth.uid() OR listed_by = auth.uid())
  WITH CHECK(created_by = auth.uid() OR listed_by = auth.uid());

-- ── partner_applications: formalize (drift — used by Expert "Sell with Orenzaa") ─
CREATE TABLE IF NOT EXISTS partner_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name    TEXT,
  city         TEXT,
  phone        TEXT,
  rera_number  TEXT,
  partner_type TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User sees own applications" ON partner_applications;
DROP POLICY IF EXISTS "User inserts application"   ON partner_applications;
DROP POLICY IF EXISTS "Admin manages applications" ON partner_applications;
CREATE POLICY "User sees own applications" ON partner_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "User inserts application"   ON partner_applications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin manages applications" ON partner_applications FOR ALL TO authenticated
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- ── expert_subscriptions (new — replaces misuse of builder_packages) ───────
CREATE TABLE IF NOT EXISTS expert_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan        TEXT NOT NULL,        -- 'Pro-Monthly' (₹599) | 'Pro-6Month' (₹999)
  amount      NUMERIC NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'Active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE expert_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Expert sees own sub"       ON expert_subscriptions;
DROP POLICY IF EXISTS "Admin manages expert subs" ON expert_subscriptions;
CREATE POLICY "Expert sees own sub" ON expert_subscriptions FOR SELECT TO authenticated
  USING (expert_id = auth.uid());
CREATE POLICY "Admin manages expert subs" ON expert_subscriptions FOR ALL TO authenticated
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- ── banners (new) ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  link_url    TEXT,
  position    TEXT NOT NULL CHECK (position IN ('home_top','home_mid','properties_top','property_detail_side')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads active banners" ON banners;
DROP POLICY IF EXISTS "Admin manages banners"        ON banners;
CREATE POLICY "Public reads active banners" ON banners FOR SELECT USING (
  is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now())
);
CREATE POLICY "Admin manages banners" ON banners FOR ALL TO authenticated
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- ── cpl_deals (new) ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cpl_deals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  builder_name    TEXT NOT NULL,
  cost_per_lead   NUMERIC NOT NULL,
  leads_purchased INT NOT NULL DEFAULT 0,
  leads_delivered INT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Paused','Completed')),
  notes           TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE cpl_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Builder sees own cpl deal" ON cpl_deals;
DROP POLICY IF EXISTS "Admin manages cpl deals"    ON cpl_deals;
CREATE POLICY "Builder sees own cpl deal" ON cpl_deals FOR SELECT TO authenticated
  USING (builder_id = auth.uid());
CREATE POLICY "Admin manages cpl deals" ON cpl_deals FOR ALL TO authenticated
  USING     (auth.jwt() ->> 'email' = current_setting('app.admin_email', true))
  WITH CHECK(auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- NOTE: payment_orders needs no schema change — its columns (plan, role) are
-- already correct; the bug was in application code (app/api/create-order),
-- which was inserting plan_type/plan_role instead. Fixed in app code, not here.
