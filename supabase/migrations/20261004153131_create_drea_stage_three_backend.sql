/*
# Create DREA Stage 3 backend and demo inventory

1. New Tables
- `profiles`: one user-owned profile per authenticated account, including name, phone, avatar, email snapshot, and non-admin account type.
- `properties`: public real-estate inventory with sale/rent status, pricing, location, specifications, publication state, and optional agent assignment.
- `property_images`: ordered image records belonging to a property.
- `amenities`: one canonical record per amenity label.
- `property_amenities`: join table connecting properties to canonical amenities.
- `agents`: fictional public-facing agent records connected to optional profiles.
- `favorites`: private user-owned saved-property records with a unique user/property pair.
- `viewing_requests`: private user-owned viewing requests with pending/contacted/confirmed/completed/cancelled states.

2. Security
- RLS is enabled on every new table.
- Published property information and related public images, amenities, and fictional agents are readable publicly.
- Profiles, favorites, and viewing requests are readable only by their owner.
- Normal users can update only editable profile columns and cannot self-assign admin.
- Authenticated users can create only their own favorites and viewing requests.

3. Important Notes
- All seeded property records are fictional demonstration inventory and are marked with the `demo` source note.
- Auth signup creates a profile through a database trigger using only buyer, renter, or property_owner account types.
- The frontend should query properties by `slug`, not assume hardcoded image arrays or local property records.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  account_type text NOT NULL DEFAULT 'buyer' CHECK (account_type IN ('buyer', 'renter', 'agent', 'property_owner', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  bio text NOT NULL DEFAULT '',
  phone text,
  email text,
  photo_url text,
  years_experience integer NOT NULL DEFAULT 0 CHECK (years_experience >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('sale', 'rent')),
  property_type text NOT NULL CHECK (property_type IN ('apartment', 'detached_house', 'duplex', 'villa', 'penthouse', 'land', 'terrace')),
  price numeric(15, 2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'NGN',
  rental_period text,
  location text NOT NULL,
  neighborhood text NOT NULL,
  city text NOT NULL,
  bedrooms integer NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
  bathrooms integer NOT NULL DEFAULT 0 CHECK (bathrooms >= 0),
  parking_spaces integer NOT NULL DEFAULT 0 CHECK (parking_spaces >= 0),
  floor_area numeric(10, 2) NOT NULL DEFAULT 0 CHECK (floor_area >= 0),
  land_area numeric(10, 2) NOT NULL DEFAULT 0 CHECK (land_area >= 0),
  furnished boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sold', 'rented', 'archived')),
  source_note text NOT NULL DEFAULT 'Fictional demonstration listing',
  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_amenities (
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_id uuid NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, property_id)
);

CREATE TABLE IF NOT EXISTS public.viewing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS properties_status_created_at_idx ON public.properties (status, created_at DESC);
CREATE INDEX IF NOT EXISTS properties_transaction_type_idx ON public.properties (transaction_type);
CREATE INDEX IF NOT EXISTS properties_city_neighborhood_idx ON public.properties (city, neighborhood);
CREATE INDEX IF NOT EXISTS property_images_property_order_idx ON public.property_images (property_id, display_order);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS viewing_requests_user_id_idx ON public.viewing_requests (user_id, created_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published properties" ON public.properties;
CREATE POLICY "Public can read published properties" ON public.properties FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "Public can read published property images" ON public.property_images;
CREATE POLICY "Public can read published property images" ON public.property_images FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.properties WHERE properties.id = property_images.property_id AND properties.status = 'published'));
DROP POLICY IF EXISTS "Public can read amenities on published properties" ON public.amenities;
CREATE POLICY "Public can read amenities on published properties" ON public.amenities FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.property_amenities pa JOIN public.properties p ON p.id = pa.property_id WHERE pa.amenity_id = amenities.id AND p.status = 'published'));
DROP POLICY IF EXISTS "Public can read published property amenities" ON public.property_amenities;
CREATE POLICY "Public can read published property amenities" ON public.property_amenities FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.properties WHERE properties.id = property_amenities.property_id AND properties.status = 'published'));
DROP POLICY IF EXISTS "Public can read public agents" ON public.agents;
CREATE POLICY "Public can read public agents" ON public.agents FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.properties WHERE properties.agent_id = agents.id AND properties.status = 'published'));

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update editable profile fields" ON public.profiles;
CREATE POLICY "Users can update editable profile fields" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND account_type <> 'admin');
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can read own favorites" ON public.favorites;
CREATE POLICY "Users can read own favorites" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own favorites" ON public.favorites;
CREATE POLICY "Users can create own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own favorites" ON public.favorites;
CREATE POLICY "Users can update own favorites" ON public.favorites FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own viewing requests" ON public.viewing_requests;
CREATE POLICY "Users can read own viewing requests" ON public.viewing_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own viewing requests" ON public.viewing_requests;
CREATE POLICY "Users can create own viewing requests" ON public.viewing_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own viewing requests" ON public.viewing_requests;
CREATE POLICY "Users can update own viewing requests" ON public.viewing_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND status = 'pending');
DROP POLICY IF EXISTS "Users can delete own viewing requests" ON public.viewing_requests;
CREATE POLICY "Users can delete own viewing requests" ON public.viewing_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'phone',
    CASE WHEN NEW.raw_user_meta_data ->> 'account_type' IN ('buyer', 'renter', 'property_owner') THEN NEW.raw_user_meta_data ->> 'account_type' ELSE 'buyer' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.amenities (name) VALUES
  ('Swimming Pool'), ('Parking'), ('24-Hour Security'), ('CCTV'), ('Generator'), ('Fitted Kitchen'), ('Smart Home'), ('Garden'), ('BQ'), ('Gym'), ('Elevator'), ('Air Conditioning'), ('Serviced')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.agents (bio, phone, email, years_experience)
SELECT 'A fictional DREA property advisor focused on thoughtful homes across Lagos.', '+234 000 000 0000', 'demo.agent@drea.properties', 8
WHERE NOT EXISTS (SELECT 1 FROM public.agents WHERE email = 'demo.agent@drea.properties');

INSERT INTO public.properties (title, slug, description, transaction_type, property_type, price, rental_period, location, neighborhood, city, bedrooms, bathrooms, parking_spaces, floor_area, furnished, featured, status, agent_id)
SELECT * FROM (VALUES
  ('The Ivory Residence', 'ivory-residence', 'A calm, light-filled residence designed around generous entertaining spaces and a private garden in the heart of Ikoyi.', 'sale', 'duplex', 425000000::numeric, NULL::text, 'Ikoyi, Lagos', 'Ikoyi', 'Lagos', 4, 5, 2, 510::numeric, false, true, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('Palm Court', 'palm-court', 'An airy furnished apartment with clean lines, a leafy outlook and the convenience of a considered residential community.', 'rent', 'apartment', 12500000::numeric, 'year', 'Lekki Phase 1, Lagos', 'Lekki Phase 1', 'Lagos', 3, 3, 1, 240::numeric, true, true, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('The Aria Villa', 'aria-villa', 'A composed waterfront villa with expansive proportions, sunset terraces and a quiet sense of arrival.', 'sale', 'villa', 520000000::numeric, NULL::text, 'Banana Island, Lagos', 'Banana Island', 'Lagos', 6, 7, 4, 850::numeric, false, true, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('Ocean House', 'ocean-house', 'A contemporary family home close to the water, with warm materials and a rooftop built for long evenings.', 'sale', 'detached_house', 185000000::numeric, NULL::text, 'Oniru, Lagos', 'Oniru', 'Lagos', 3, 4, 2, 310::numeric, false, true, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('Cedar Terrace', 'cedar-terrace', 'A refined terrace in a discreet estate, pairing practical family living with a central Victoria Island address.', 'rent', 'terrace', 18000000::numeric, 'year', 'Victoria Island, Lagos', 'Victoria Island', 'Lagos', 4, 4, 2, 360::numeric, true, false, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('The Willow Apartment', 'the-willow', 'A bright apartment in a quiet GRA setting, close to the city’s business districts and everyday amenities.', 'sale', 'apartment', 98000000::numeric, NULL::text, 'Ikeja GRA, Lagos', 'Ikeja', 'Lagos', 3, 3, 1, 205::numeric, false, false, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('Aja Grove Land', 'ajah-grove', 'A well-positioned parcel within a growing residential corridor, suited to a private build or long-term hold.', 'sale', 'land', 45000000::numeric, NULL::text, 'Ajah, Lagos', 'Ajah', 'Lagos', 0, 0, 0, 600::numeric, false, false, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('Yaba Courtyard', 'yaba-courtyard', 'A smart two-bedroom apartment with a relaxed courtyard feel in one of Lagos’s most connected creative districts.', 'rent', 'apartment', 4500000::numeric, 'year', 'Yaba, Lagos', 'Yaba', 'Lagos', 2, 2, 1, 128::numeric, false, false, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('The Abuja Pavilion', 'abuja-pavilion', 'A substantial detached home with a strong architectural silhouette, generous grounds and a quiet Maitama setting.', 'sale', 'detached_house', 310000000::numeric, NULL::text, 'Maitama, Abuja', 'Maitama', 'Abuja', 5, 6, 3, 640::numeric, false, false, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('Park View Residences', 'abuja-park-view', 'A turnkey city apartment with a generous living room and a full suite of resident amenities.', 'rent', 'apartment', 9500000::numeric, 'year', 'Wuse 2, Abuja', 'Wuse 2', 'Abuja', 3, 3, 2, 220::numeric, true, false, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('The Courtyard House', 'ibadan-courtyard', 'A generously scaled family house with a leafy garden and room for the next chapter.', 'sale', 'detached_house', 135000000::numeric, NULL::text, 'Bodija, Ibadan', 'Bodija', 'Ibadan', 4, 4, 3, 480::numeric, false, false, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1)),
  ('Ikoyi Mews', 'ikoyi-mews', 'A quietly luxurious furnished duplex with a private terrace and easy access to Ikoyi’s best addresses.', 'rent', 'duplex', 28000000::numeric, 'year', 'Ikoyi, Lagos', 'Ikoyi', 'Lagos', 4, 5, 2, 410::numeric, true, false, 'published', (SELECT id FROM public.agents WHERE email = 'demo.agent@drea.properties' LIMIT 1))
) AS seed(title, slug, description, transaction_type, property_type, price, rental_period, location, neighborhood, city, bedrooms, bathrooms, parking_spaces, floor_area, furnished, featured, status, agent_id)
WHERE NOT EXISTS (SELECT 1 FROM public.properties p WHERE p.slug = seed.slug);

INSERT INTO public.property_images (property_id, image_url, alt_text, display_order)
SELECT p.id, seed.image_url, p.title, seed.display_order
FROM public.properties p
JOIN (VALUES
  ('ivory-residence', 'https://images.pexels.com/photos/24805054/pexels-photo-24805054.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('ivory-residence', 'https://images.pexels.com/photos/35361403/pexels-photo-35361403.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
  ('palm-court', 'https://images.pexels.com/photos/19828893/pexels-photo-19828893.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('palm-court', 'https://images.pexels.com/photos/2771935/pexels-photo-2771935.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
  ('aria-villa', 'https://images.pexels.com/photos/31817160/pexels-photo-31817160.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('aria-villa', 'https://images.pexels.com/photos/31817157/pexels-photo-31817157.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
  ('ocean-house', 'https://images.pexels.com/photos/31032367/pexels-photo-31032367.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('ocean-house', 'https://images.pexels.com/photos/34277690/pexels-photo-34277690.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
  ('cedar-terrace', 'https://images.pexels.com/photos/28054874/pexels-photo-28054874.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('the-willow', 'https://images.pexels.com/photos/2771935/pexels-photo-2771935.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('ajah-grove', 'https://images.pexels.com/photos/15010364/pexels-photo-15010364.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('yaba-courtyard', 'https://images.pexels.com/photos/8735930/pexels-photo-8735930.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('abuja-pavilion', 'https://images.pexels.com/photos/36394726/pexels-photo-36394726.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('abuja-park-view', 'https://images.pexels.com/photos/19828893/pexels-photo-19828893.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('ibadan-courtyard', 'https://images.pexels.com/photos/20989520/pexels-photo-20989520.jpeg?auto=compress&cs=tinysrgb&w=1200', 0), ('ikoyi-mews', 'https://images.pexels.com/photos/19084143/pexels-photo-19084143.jpeg?auto=compress&cs=tinysrgb&w=1200', 0)
) AS seed(slug, image_url, display_order) ON p.slug = seed.slug
WHERE NOT EXISTS (SELECT 1 FROM public.property_images i WHERE i.property_id = p.id);

INSERT INTO public.property_amenities (property_id, amenity_id)
SELECT p.id, a.id FROM public.properties p CROSS JOIN public.amenities a
WHERE (p.slug, a.name) IN (
  ('ivory-residence', 'Swimming Pool'), ('ivory-residence', 'Fitted Kitchen'), ('ivory-residence', '24-Hour Security'),
  ('palm-court', 'Generator'), ('palm-court', 'Gym'), ('palm-court', 'Swimming Pool'),
  ('aria-villa', 'Swimming Pool'), ('aria-villa', '24-Hour Security'), ('aria-villa', 'BQ'),
  ('ocean-house', 'Garden'), ('ocean-house', '24-Hour Security'),
  ('cedar-terrace', 'Smart Home'), ('cedar-terrace', 'Gym'), ('cedar-terrace', 'Generator'),
  ('the-willow', 'Elevator'), ('the-willow', 'Gym'), ('the-willow', '24-Hour Security'),
  ('ajah-grove', '24-Hour Security'), ('yaba-courtyard', 'Generator'), ('yaba-courtyard', '24-Hour Security'),
  ('abuja-pavilion', 'Swimming Pool'), ('abuja-pavilion', 'Garden'), ('abuja-pavilion', 'BQ'),
  ('abuja-park-view', 'Gym'), ('abuja-park-view', 'Generator'), ('ibadan-courtyard', 'Garden'),
  ('ibadan-courtyard', '24-Hour Security'), ('ikoyi-mews', 'Swimming Pool'), ('ikoyi-mews', 'Gym')
) ON CONFLICT DO NOTHING;
