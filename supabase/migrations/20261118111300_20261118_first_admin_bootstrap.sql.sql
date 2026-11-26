/*
# First-admin bootstrap for ShiftNear staff access

1. What this changes
- Replaces the `handle_new_user()` trigger function so the FIRST account ever created in `public.profiles` is assigned `account_type = 'admin'`. Every subsequent account keeps the previous behavior (buyer/renter/property_owner from signup metadata, defaulting to buyer).
- This lets the project owner create the first staff account through the normal signup page and immediately sign in to the admin dashboard, without a pre-seeded admin account or manual database edits.

2. How it works
- On insert into `auth.users`, the trigger checks `SELECT count(*) FROM public.profiles`. If zero, the new profile is inserted with `account_type = 'admin'`. Otherwise it falls back to the account_type supplied in `raw_user_meta_data` (only buyer/renter/property_owner are honored; anything else becomes buyer).
- The existing `on_auth_user_created` trigger is reused (dropped + recreated to bind to the new function body).

3. Security
- No changes to RLS policies or grants. `profiles` remains RLS-enabled with the existing admin/owner policies.
- Only the very first profile is auto-promoted; all later signups remain regular accounts that an existing admin must promote. This is a one-time bootstrap, not an ongoing privilege escalation.
- The function stays SECURITY DEFINER with a fixed `search_path = public`, matching the original definition.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_first boolean;
  requested_type text;
BEGIN
  SELECT count(*) = 0 INTO is_first FROM public.profiles;

  IF is_first THEN
    INSERT INTO public.profiles (id, full_name, email, phone, account_type)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
      COALESCE(NEW.email, ''),
      NEW.raw_user_meta_data ->> 'phone',
      'admin'
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    requested_type := NEW.raw_user_meta_data ->> 'account_type';
    INSERT INTO public.profiles (id, full_name, email, phone, account_type)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
      COALESCE(NEW.email, ''),
      NEW.raw_user_meta_data ->> 'phone',
      CASE WHEN requested_type IN ('buyer', 'renter', 'property_owner') THEN requested_type ELSE 'buyer' END
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
