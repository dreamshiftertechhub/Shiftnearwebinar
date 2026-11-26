/*
# DREA Stage 4 — Revoke anon EXECUTE on SECURITY DEFINER functions

1. Security
- Revoke EXECUTE on all SECURITY DEFINER management functions from anon and public roles.
- These functions (approve_listing, reject_listing, update_viewing_status, assign_viewing_agent, assign_property_agent, verify_agent, update_lead_status) should only be callable by authenticated users.
- Helper functions (is_admin, is_agent, current_agent_id, owns_property, is_assigned_agent) are also restricted to authenticated since anon has no auth.uid().
*/

REVOKE EXECUTE ON FUNCTION public.approve_listing(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.reject_listing(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.update_viewing_status(uuid, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.assign_viewing_agent(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.assign_property_agent(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.verify_agent(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.update_lead_status(uuid, text, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_agent() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.current_agent_id() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.owns_property(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_assigned_agent(uuid) FROM anon, public;
