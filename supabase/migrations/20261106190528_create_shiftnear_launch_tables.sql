/*
# ShiftNear Pre-launch Tables

Creates the data tables for the ShiftNear pre-launch website: webinar registrations,
early access sign-ups, vendor interest submissions, and contact enquiries.

## 1. New Tables

- `webinar_registrations` — people who register for the ShiftNear Live webinar.
  Columns: id, full_name, email, phone (optional), city (optional), role
  (customer/vendor/investor/other), questions (optional), consent (bool),
  created_at.

- `early_access_signups` — people who request early access to ShiftNear.
  Columns: id, full_name, email, role (customer/vendor), city (optional),
  created_at.

- `vendor_interest` — vendors/businesses who express interest in listing on
  ShiftNear. Columns: id, business_name, full_name, email, phone (optional),
  business_type (optional), city (optional), message (optional), created_at.

- `contact_enquiries` — general contact / partnership messages.
  Columns: id, full_name, email, subject, message, created_at.

## 2. Security (RLS + Grants + Policies)

All four tables are public-insert (anon + authenticated can INSERT) so visitors
can submit forms without signing in. Reads and deletes are admin-only: an
authenticated user whose profile.account_type = 'admin' can SELECT and DELETE.
No updates are allowed from the client.

- RLS enabled on every table.
- GRANT INSERT to anon, authenticated on all tables.
- GRANT SELECT, DELETE to authenticated on all tables (admin only via policy).
- INSERT policies: TO anon, authenticated WITH CHECK (true) — public forms.
- SELECT/DELETE policies: TO authenticated, scoped to admins via a profile
  account_type check.
*/

-- Helper: admin check re-used across policies. Inlined as EXISTS subqueries
-- so we avoid creating a SECURITY DEFINER function for this simple launch site.

CREATE TABLE IF NOT EXISTS webinar_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text,
  role text NOT NULL DEFAULT 'other',
  questions text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS early_access_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'customer',
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_type text,
  city text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT 'General',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_access_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT INSERT ON webinar_registrations TO anon, authenticated;
GRANT SELECT, DELETE ON webinar_registrations TO authenticated;

GRANT INSERT ON early_access_signups TO anon, authenticated;
GRANT SELECT, DELETE ON early_access_signups TO authenticated;

GRANT INSERT ON vendor_interest TO anon, authenticated;
GRANT SELECT, DELETE ON vendor_interest TO authenticated;

GRANT INSERT ON contact_enquiries TO anon, authenticated;
GRANT SELECT, DELETE ON contact_enquiries TO authenticated;

-- Indexes for admin ordering
CREATE INDEX IF NOT EXISTS webinar_registrations_created_at_idx ON webinar_registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS early_access_signups_created_at_idx ON early_access_signups (created_at DESC);
CREATE INDEX IF NOT EXISTS vendor_interest_created_at_idx ON vendor_interest (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_enquiries_created_at_idx ON contact_enquiries (created_at DESC);

-- webinar_registrations policies
DROP POLICY IF EXISTS "public_insert_webinar_registrations" ON webinar_registrations;
CREATE POLICY "public_insert_webinar_registrations" ON webinar_registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_webinar_registrations" ON webinar_registrations;
CREATE POLICY "admin_select_webinar_registrations" ON webinar_registrations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.account_type = 'admin'));

DROP POLICY IF EXISTS "admin_delete_webinar_registrations" ON webinar_registrations;
CREATE POLICY "admin_delete_webinar_registrations" ON webinar_registrations
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.account_type = 'admin'));

-- early_access_signups policies
DROP POLICY IF EXISTS "public_insert_early_access_signups" ON early_access_signups;
CREATE POLICY "public_insert_early_access_signups" ON early_access_signups
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_early_access_signups" ON early_access_signups;
CREATE POLICY "admin_select_early_access_signups" ON early_access_signups
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.account_type = 'admin'));

DROP POLICY IF EXISTS "admin_delete_early_access_signups" ON early_access_signups;
CREATE POLICY "admin_delete_early_access_signups" ON early_access_signups
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.account_type = 'admin'));

-- vendor_interest policies
DROP POLICY IF EXISTS "public_insert_vendor_interest" ON vendor_interest;
CREATE POLICY "public_insert_vendor_interest" ON vendor_interest
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_vendor_interest" ON vendor_interest;
CREATE POLICY "admin_select_vendor_interest" ON vendor_interest
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.account_type = 'admin'));

DROP POLICY IF EXISTS "admin_delete_vendor_interest" ON vendor_interest;
CREATE POLICY "admin_delete_vendor_interest" ON vendor_interest
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.account_type = 'admin'));

-- contact_enquiries policies
DROP POLICY IF EXISTS "public_insert_contact_enquiries" ON contact_enquiries;
CREATE POLICY "public_insert_contact_enquiries" ON contact_enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_contact_enquiries" ON contact_enquiries;
CREATE POLICY "admin_select_contact_enquiries" ON contact_enquiries
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.account_type = 'admin'));

DROP POLICY IF EXISTS "admin_delete_contact_enquiries" ON contact_enquiries;
CREATE POLICY "admin_delete_contact_enquiries" ON contact_enquiries
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.account_type = 'admin'));
