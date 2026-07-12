-- Migration 006: Onboarding gate, profile cleanup, expert verification, advertise enquiries
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/angokuzvthqzezdnpptf/sql
-- Safe to re-run (IF NOT EXISTS guards throughout).

-- ── profiles: onboarding gate ───────────────────────────────────────────────
-- Backfill-safe: adding the column with DEFAULT true fills every existing row
-- with true immediately (Postgres backfills a constant DEFAULT on ADD COLUMN),
-- so current users are never sent to onboarding. Only after that do we flip
-- the default to false, so brand-new profiles from here on require it.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ALTER COLUMN profile_complete SET DEFAULT false;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- ── profiles: expert verification badge ─────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_verification_status_check
  CHECK (verification_status IN ('none','pending','verified','rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMPTZ;

-- ── profiles: fix missing admin write access (drift fix) ───────────────────
-- No migration has ever granted admins write access to OTHER users' profile
-- rows. AdminPartnersClient's approve/reject buttons already attempt
-- `update({ role, is_partner }).eq('id', app.user_id)` on someone else's row
-- -- under RLS with no matching policy that silently affects 0 rows. The new
-- verification approve/reject flow would hit the same wall. Fixing it here.
DROP POLICY IF EXISTS "Admin manages all profiles" ON profiles;
CREATE POLICY "Admin manages all profiles" ON profiles FOR ALL TO authenticated
  USING     ((select auth.email()) = 'tellitorg1@gmail.com')
  WITH CHECK((select auth.email()) = 'tellitorg1@gmail.com');

-- ── advertise_enquiries (new) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS advertise_enquiries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  company    TEXT,
  phone      TEXT NOT NULL,
  city       TEXT,
  package    TEXT,
  message    TEXT,
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','deal_done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE advertise_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit an enquiry" ON advertise_enquiries;
DROP POLICY IF EXISTS "Admin manages enquiries" ON advertise_enquiries;
CREATE POLICY "Anyone can submit an enquiry" ON advertise_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manages enquiries" ON advertise_enquiries FOR ALL TO authenticated
  USING     ((select auth.email()) = 'tellitorg1@gmail.com')
  WITH CHECK((select auth.email()) = 'tellitorg1@gmail.com');
