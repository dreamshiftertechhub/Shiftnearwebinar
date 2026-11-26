/*
# First-admin bootstrap (admin-count based)

1. What this changes
- Refines `handle_new_user()` so the bootstrap condition is "no admin profile exists yet" instead of "no profile exists at all". This way the project owner can still self-promote by signing up even if a non-admin (buyer/renter/property_owner) profile was created earlier during testing.

2. How it works
- On insert into `auth.users`, the trigger checks `SELECT count(*) FROM public.profiles WHERE account_type = 'admin'`. If zero, the new profile is inserted as `admin`. Otherwise the normal buyer/renter/property_owner fallback applies.
- The existing `on_auth_user_created` trigger is rebound to the new function body.

3. Security
- No RLS or grant changes. Only the first admin is auto-promoted; once an admin exists, all future signups are regular accounts that must be promoted by an admin.
- SECURITY DEFINER with fixed `search_path = public` is preserved.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  has_admin boolean;
  requested_type text;
BEGIN
  SELECT count(*) > 0 INTO has_admin FROM public.profiles WHERE account_type = 'admin';

  IF NOT has_admin THEN
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
