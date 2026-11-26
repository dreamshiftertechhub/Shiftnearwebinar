/*
# Add protected admin access management

1. Purpose
- Add a safe server-side function for administrators to grant or remove dashboard access from registered accounts.
- Narrow direct profile updates so signed-in users cannot change their own account type through the browser.

2. Modified objects
- `public.profiles`: authenticated users may continue editing full name, phone, and avatar, but `account_type` is no longer directly writable through the Data API.
- New function `public.set_profile_account_type(profile_id, account_type)`: changes a profile role only when the caller is an existing admin and the requested role is one of the supported account types.

3. Security
- The function derives the acting administrator from `auth.uid()` and checks the caller's current profile in the database.
- Anonymous callers cannot execute the function.
- The function prevents removing the final admin account.
- Existing profile row-level policies remain in place; this adds a server-enforced privilege boundary for role changes.

4. Important notes
- Staff members can still create accounts and sign in normally.
- An administrator can promote a signed-in account to admin from the dashboard.
- Removing admin access changes the profile to `buyer`; it does not delete the user or their data.
*/

REVOKE UPDATE (account_type) ON public.profiles FROM authenticated;

CREATE OR REPLACE FUNCTION public.set_profile_account_type(profile_id uuid, requested_account_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_type text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND account_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF requested_account_type NOT IN ('buyer', 'renter', 'agent', 'property_owner', 'admin') THEN
    RAISE EXCEPTION 'Invalid account type';
  END IF;

  SELECT account_type INTO current_type
  FROM public.profiles
  WHERE id = profile_id;

  IF current_type IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF current_type = 'admin' AND requested_account_type <> 'admin' AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE account_type = 'admin' AND id <> profile_id
  ) THEN
    RAISE EXCEPTION 'At least one admin is required';
  END IF;

  UPDATE public.profiles
  SET account_type = requested_account_type, updated_at = now()
  WHERE id = profile_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_profile_account_type(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_profile_account_type(uuid, text) TO authenticated;
