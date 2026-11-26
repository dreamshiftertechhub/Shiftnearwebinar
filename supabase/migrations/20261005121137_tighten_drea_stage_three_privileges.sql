/*
# Tighten DREA Stage 3 API privileges

1. Changes
- Keep public SELECT access to published properties and their public relationships.
- Keep authenticated owner-scoped access to profiles, favorites, and viewing requests.
- Remove unused browser INSERT, UPDATE, and DELETE privileges from public inventory and relationship tables.
- Remove direct profile INSERT and DELETE privileges from authenticated users.

2. Security
- Revoke EXECUTE on the private profile-creation trigger function from anon and authenticated roles.
- Preserve the trigger's ability to create profiles during Supabase Auth signup.
- Preserve only the profile columns that a normal user may edit.

3. Important Notes
- This migration does not delete or alter any stored data.
- Property publishing and agent management remain operator-only and are not exposed to normal users.
*/

REVOKE INSERT, UPDATE, DELETE ON public.properties FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.property_images FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.amenities FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.property_amenities FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.agents FROM anon, authenticated;
REVOKE INSERT, DELETE ON public.profiles FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.profiles FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
