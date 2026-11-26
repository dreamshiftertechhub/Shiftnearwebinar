/*
# DREA Stage 4 — Grant column privileges and add updated_at to viewing_requests

1. Changes
- Grant UPDATE on viewing_requests.assigned_agent_id and admin_notes to authenticated (for admin/agent use via RPC functions).
- Add updated_at column to viewing_requests for tracking changes.
- Grant UPDATE on additional profile columns to authenticated so admin can manage account_type.
- Grant UPDATE on agents to authenticated so admin can manage agent records.
- Grant UPDATE on leads to authenticated.
- Re-grant viewing_requests UPDATE to allow admin/agent status updates via direct table access (RLS controls who can do it).
*/

-- Add updated_at to viewing_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'viewing_requests' AND column_name = 'updated_at') THEN
    ALTER TABLE public.viewing_requests ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Grant UPDATE on viewing_requests (RLS policies control who can update)
GRANT UPDATE ON public.viewing_requests TO authenticated;

-- Grant UPDATE on leads
GRANT UPDATE ON public.leads TO authenticated;

-- Grant UPDATE on agents
GRANT UPDATE ON public.agents TO authenticated;

-- Grant additional profile UPDATE columns (full_name, phone, avatar_url already granted)
-- Now also allow account_type updates for admin
GRANT UPDATE (full_name, phone, avatar_url, account_type) ON public.profiles TO authenticated;
