/*
# Complete DREA API privilege hardening

1. Changes
- Remove public execution rights from the internal signup profile trigger.
- Remove anonymous profile reads.
- Remove anonymous write rights from favorites and viewing requests.

2. Security
- The signup trigger remains available to PostgreSQL's authentication trigger mechanism but is not callable through the browser REST API.
- User-owned data remains available only to authenticated owners through RLS.

3. Important Notes
- This is a privilege-only change and does not modify or delete stored rows.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.favorites FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.viewing_requests FROM anon;
