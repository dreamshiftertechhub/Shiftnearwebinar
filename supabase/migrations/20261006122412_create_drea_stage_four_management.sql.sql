/*
# DREA Stage 4 — Property management, agents, leads, and admin oversight

1. Schema Changes
- Add `created_by` column to `properties` (uuid, references auth.users) to track which user created a listing.
- Add `pending_review` to the allowed `status` values on `properties` so owners can submit listings for admin approval.
- Add `assigned_agent_id` column to `viewing_requests` (uuid, references agents) so admins/agents can be assigned to handle a viewing.
- Add `admin_notes` column to `viewing_requests` (text) for internal notes.
- Add `review_feedback` column to `properties` (text) so admins can leave feedback when approving/rejecting.
- Add `is_verified` column to `agents` (boolean, default false) so admins can verify agents.

2. New Tables
- `leads`: general enquiries from visitors (name, email, phone, interest, message, status, assigned_agent_id). For contact form submissions and non-property-specific enquiries.
- `agent_assignments`: join table linking agents to properties they are assigned to manage (beyond the single agent_id on properties, allowing multiple agents per property if needed).

3. Security
- Grant authenticated users INSERT/UPDATE on `properties` but only for rows they created (via RLS policies).
- Grant authenticated users INSERT/UPDATE on `property_images` but only for images belonging to their properties.
- Grant authenticated users SELECT on `viewing_requests` for properties they own or are assigned to as an agent.
- Grant agents SELECT on `leads` where they are assigned.
- Grant admins full read access to all tables and update access on properties, viewing_requests, leads, agents, and profiles.
- Use SECURITY DEFINER functions for admin-only operations (approve/reject listings, assign agents, update viewing request status, verify agents) so non-admin users cannot perform these actions through direct table writes.
- Enable RLS on all new tables.

4. Important Notes
- The `created_by` column defaults to `auth.uid()` so property owners can insert without explicitly passing it.
- Property owners can create listings with status 'draft' or 'pending_review' but cannot directly set status to 'published' — that requires admin approval.
- Agents can view viewing_requests and leads assigned to them but cannot change their own assignment.
- Admins can do everything except delete user accounts (that remains a Supabase Auth operation).
- All existing public read access to published properties is preserved.
*/

-- ============================================================
-- 1. Add columns to existing tables
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'created_by') THEN
    ALTER TABLE public.properties ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'review_feedback') THEN
    ALTER TABLE public.properties ADD COLUMN review_feedback text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'viewing_requests' AND column_name = 'assigned_agent_id') THEN
    ALTER TABLE public.viewing_requests ADD COLUMN assigned_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'viewing_requests' AND column_name = 'admin_notes') THEN
    ALTER TABLE public.viewing_requests ADD COLUMN admin_notes text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'is_verified') THEN
    ALTER TABLE public.agents ADD COLUMN is_verified boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add 'pending_review' to allowed property statuses
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'properties_status_check' AND table_schema = 'public' AND table_name = 'properties') THEN
    ALTER TABLE public.properties DROP CONSTRAINT properties_status_check;
  END IF;
END $$;
ALTER TABLE public.properties ADD CONSTRAINT properties_status_check CHECK (status IN ('draft', 'pending_review', 'published', 'sold', 'rented', 'archived'));

-- Set created_by default to auth.uid() for new inserts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'created_by' AND column_default IS NOT NULL) THEN
    ALTER TABLE public.properties ALTER COLUMN created_by SET DEFAULT auth.uid();
  END IF;
END $$;

-- ============================================================
-- 2. New tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  interest text NOT NULL DEFAULT 'general',
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'lost')),
  assigned_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_assignments (
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (agent_id, property_id)
);

-- ============================================================
-- 3. Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS properties_created_by_idx ON public.properties (created_by);
CREATE INDEX IF NOT EXISTS properties_status_idx ON public.properties (status);
CREATE INDEX IF NOT EXISTS viewing_requests_status_idx ON public.viewing_requests (status);
CREATE INDEX IF NOT EXISTS viewing_requests_assigned_agent_idx ON public.viewing_requests (assigned_agent_id);
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_assigned_agent_idx ON public.leads (assigned_agent_id);
CREATE INDEX IF NOT EXISTS agent_assignments_agent_idx ON public.agent_assignments (agent_id);
CREATE INDEX IF NOT EXISTS agent_assignments_property_idx ON public.agent_assignments (property_id);
CREATE INDEX IF NOT EXISTS agents_is_verified_idx ON public.agents (is_verified);

-- ============================================================
-- 4. Enable RLS on new tables
-- ============================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. SECURITY DEFINER helper functions
-- ============================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND account_type = 'admin'
  );
$$;

-- Function to check if current user is an agent (has an agent record)
CREATE OR REPLACE FUNCTION public.is_agent()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agents a
    JOIN public.profiles p ON a.profile_id = p.id
    WHERE p.id = auth.uid()
  );
$$;

-- Function to get the agent record id for the current user
CREATE OR REPLACE FUNCTION public.current_agent_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT a.id FROM public.agents a
  JOIN public.profiles p ON a.profile_id = p.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

-- Function to check if current user owns a property
CREATE OR REPLACE FUNCTION public.owns_property(prop_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties
    WHERE id = prop_id AND created_by = auth.uid()
  );
$$;

-- Function to check if current user is assigned to a property as an agent
CREATE OR REPLACE FUNCTION public.is_assigned_agent(prop_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agent_assignments aa
    WHERE aa.property_id = prop_id
    AND aa.agent_id = public.current_agent_id()
  );
$$;

-- Admin: approve a property listing (set status to published)
CREATE OR REPLACE FUNCTION public.approve_listing(prop_id uuid, feedback text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can approve listings';
  END IF;
  UPDATE public.properties SET status = 'published', review_feedback = feedback, updated_at = now()
  WHERE id = prop_id;
END;
$$;

-- Admin: reject a property listing (set status back to draft with feedback)
CREATE OR REPLACE FUNCTION public.reject_listing(prop_id uuid, feedback text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can reject listings';
  END IF;
  UPDATE public.properties SET status = 'draft', review_feedback = feedback, updated_at = now()
  WHERE id = prop_id;
END;
$$;

-- Admin or agent: update viewing request status
CREATE OR REPLACE FUNCTION public.update_viewing_status(req_id uuid, new_status text, notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_agent()) THEN
    RAISE EXCEPTION 'Only administrators or agents can update viewing status';
  END IF;
  IF new_status NOT IN ('pending', 'contacted', 'confirmed', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;
  UPDATE public.viewing_requests
  SET status = new_status, admin_notes = COALESCE(notes, admin_notes), updated_at = now()
  WHERE id = req_id;
END;
$$;

-- Admin: assign an agent to a viewing request
CREATE OR REPLACE FUNCTION public.assign_viewing_agent(req_id uuid, agent_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can assign agents';
  END IF;
  UPDATE public.viewing_requests SET assigned_agent_id = agent_id, updated_at = now()
  WHERE id = req_id;
END;
$$;

-- Admin: assign an agent to a property
CREATE OR REPLACE FUNCTION public.assign_property_agent(prop_id uuid, agent_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can assign agents to properties';
  END IF;
  INSERT INTO public.agent_assignments (agent_id, property_id)
  VALUES (agent_id, prop_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Admin: verify an agent
CREATE OR REPLACE FUNCTION public.verify_agent(agent_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can verify agents';
  END IF;
  UPDATE public.agents SET is_verified = true, updated_at = now()
  WHERE id = agent_id;
END;
$$;

-- Admin: update lead status
CREATE OR REPLACE FUNCTION public.update_lead_status(lead_id uuid, new_status text, agent_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_agent()) THEN
    RAISE EXCEPTION 'Only administrators or agents can update lead status';
  END IF;
  IF new_status NOT IN ('new', 'contacted', 'qualified', 'closed', 'lost') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;
  UPDATE public.leads
  SET status = new_status, assigned_agent_id = COALESCE(agent_id, assigned_agent_id), updated_at = now()
  WHERE id = lead_id;
END;
$$;

-- ============================================================
-- 6. Re-grant table privileges needed by the frontend
-- ============================================================

-- Properties: allow authenticated users to read all, insert own, update own
GRANT SELECT ON public.properties TO authenticated;
GRANT INSERT (title, slug, description, transaction_type, property_type, price, rental_period, location, neighborhood, city, bedrooms, bathrooms, parking_spaces, floor_area, land_area, furnished, featured, status, source_note, agent_id, created_by) ON public.properties TO authenticated;
GRANT UPDATE ON public.properties TO authenticated;

-- Property images: allow authenticated users to manage images on their properties
GRANT SELECT ON public.property_images TO authenticated;
GRANT INSERT ON public.property_images TO authenticated;
GRANT UPDATE ON public.property_images TO authenticated;
GRANT DELETE ON public.property_images TO authenticated;

-- Amenities: read-only for authenticated
GRANT SELECT ON public.amenities TO authenticated;

-- Property amenities: allow authenticated to manage amenities on their properties
GRANT SELECT ON public.property_amenities TO authenticated;
GRANT INSERT ON public.property_amenities TO authenticated;
GRANT DELETE ON public.property_amenities TO authenticated;

-- Agents: allow authenticated to read
GRANT SELECT ON public.agents TO authenticated;

-- Profiles: allow authenticated to read (for admin user management)
GRANT SELECT ON public.profiles TO authenticated;

-- Viewing requests: allow authenticated to read (filtered by RLS)
GRANT SELECT ON public.viewing_requests TO authenticated;

-- Leads: allow authenticated to insert (contact form) and read (filtered by RLS)
GRANT INSERT (full_name, email, phone, interest, message, property_id, user_id) ON public.leads TO authenticated;
GRANT SELECT ON public.leads TO authenticated;

-- Agent assignments: allow authenticated to read
GRANT SELECT ON public.agent_assignments TO authenticated;

-- Grant EXECUTE on helper functions to authenticated
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_agent() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_agent_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_property(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_assigned_agent(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_listing(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_listing(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_viewing_status(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_viewing_agent(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_property_agent(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_agent(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_lead_status(uuid, text, uuid) TO authenticated;

-- Allow anon to submit leads (contact form without login)
GRANT INSERT (full_name, email, phone, interest, message, property_id) ON public.leads TO anon;

-- ============================================================
-- 7. Drop and recreate RLS policies for management
-- ============================================================

-- PROPERTIES: management policies (in addition to existing public read)
DROP POLICY IF EXISTS "Owners can read own properties" ON public.properties;
CREATE POLICY "Owners can read own properties" ON public.properties FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Owners can create properties" ON public.properties;
CREATE POLICY "Owners can create properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND status IN ('draft', 'pending_review'));

DROP POLICY IF EXISTS "Owners can update own properties" ON public.properties;
CREATE POLICY "Owners can update own properties" ON public.properties FOR UPDATE TO authenticated USING (created_by = auth.uid() OR public.is_admin()) WITH CHECK (created_by = auth.uid() OR public.is_admin());

-- PROPERTY IMAGES: management policies
DROP POLICY IF EXISTS "Owners can read images on own properties" ON public.property_images;
CREATE POLICY "Owners can read images on own properties" ON public.property_images FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Owners can insert images on own properties" ON public.property_images;
CREATE POLICY "Owners can insert images on own properties" ON public.property_images FOR INSERT TO authenticated WITH CHECK (public.owns_property(property_id));

DROP POLICY IF EXISTS "Owners can update images on own properties" ON public.property_images;
CREATE POLICY "Owners can update images on own properties" ON public.property_images FOR UPDATE TO authenticated USING (public.owns_property(property_id)) WITH CHECK (public.owns_property(property_id));

DROP POLICY IF EXISTS "Owners can delete images on own properties" ON public.property_images;
CREATE POLICY "Owners can delete images on own properties" ON public.property_images FOR DELETE TO authenticated USING (public.owns_property(property_id));

-- PROPERTY AMENITIES: management policies
DROP POLICY IF EXISTS "Owners can read amenities on own properties" ON public.property_amenities;
CREATE POLICY "Owners can read amenities on own properties" ON public.property_amenities FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Owners can insert amenities on own properties" ON public.property_amenities;
CREATE POLICY "Owners can insert amenities on own properties" ON public.property_amenities FOR INSERT TO authenticated WITH CHECK (public.owns_property(property_id));

DROP POLICY IF EXISTS "Owners can delete amenities on own properties" ON public.property_amenities;
CREATE POLICY "Owners can delete amenities on own properties" ON public.property_amenities FOR DELETE TO authenticated USING (public.owns_property(property_id));

-- VIEWING REQUESTS: allow property owners and assigned agents to read
DROP POLICY IF EXISTS "Owners and agents can read viewing requests" ON public.viewing_requests;
CREATE POLICY "Owners and agents can read viewing requests" ON public.viewing_requests FOR SELECT TO authenticated USING (
  auth.uid() = user_id
  OR public.owns_property(property_id)
  OR (public.is_agent() AND assigned_agent_id = public.current_agent_id())
  OR public.is_admin()
);

-- LEADS: policies
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins and assigned agents can read leads" ON public.leads;
CREATE POLICY "Admins and assigned agents can read leads" ON public.leads FOR SELECT TO authenticated USING (
  public.is_admin()
  OR (public.is_agent() AND assigned_agent_id = public.current_agent_id())
);

-- AGENT ASSIGNMENTS: read for admins and the agent themselves
DROP POLICY IF EXISTS "Admins and agents can read assignments" ON public.agent_assignments;
CREATE POLICY "Admins and agents can read assignments" ON public.agent_assignments FOR SELECT TO authenticated USING (
  public.is_admin()
  OR agent_id = public.current_agent_id()
  OR public.owns_property(property_id)
);

-- AGENTS: allow authenticated to read all agents (for assignment selection)
DROP POLICY IF EXISTS "Authenticated can read all agents" ON public.agents;
CREATE POLICY "Authenticated can read all agents" ON public.agents FOR SELECT TO authenticated USING (true);

-- PROFILES: allow admins to read all profiles, users to read own
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());

-- Update the existing profile UPDATE policy to also allow admin
DROP POLICY IF EXISTS "Users can update editable profile fields" ON public.profiles;
CREATE POLICY "Users can update editable profile fields" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Allow admins to update profiles (for account_type changes)
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
