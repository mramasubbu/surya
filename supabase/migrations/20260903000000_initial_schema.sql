-- ==============================================================================
-- SURYA MULTICUISINE RESTAURANT & CAFE — DATABASE MIGRATION & SEED SCRIPT
-- Target: PostgreSQL / Supabase Free Tier
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLES DEFINITION

-- 3.1 CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 MENU ITEMS
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  price_label TEXT,
  diet TEXT NOT NULL CHECK (diet IN ('veg', 'non-veg', 'egg')),
  image_url TEXT,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 OFFERS & PROMOTIONS
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_tag TEXT,
  start_date DATE,
  end_date DATE,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.4 TABLE BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  guests INTEGER NOT NULL CHECK (guests >= 1 AND guests <= 50),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.5 CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.6 ADMIN USERS (RBAC)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TRIGGERS FOR AUTO UPDATED_AT
DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER trigger_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_offers_updated_at ON public.offers;
CREATE TRIGGER trigger_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON public.bookings;
CREATE TRIGGER trigger_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER trigger_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON public.menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_active ON public.offers(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_messages(status);

-- 6. AUTHORIZATION HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 7.1 CATEGORIES POLICIES
DROP POLICY IF EXISTS "Public can read active categories" ON public.categories;
CREATE POLICY "Public can read active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- 7.2 MENU ITEMS POLICIES
DROP POLICY IF EXISTS "Public can read active menu items" ON public.menu_items;
CREATE POLICY "Public can read active menu items"
  ON public.menu_items FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert menu items" ON public.menu_items;
CREATE POLICY "Admins can insert menu items"
  ON public.menu_items FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update menu items" ON public.menu_items;
CREATE POLICY "Admins can update menu items"
  ON public.menu_items FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete menu items" ON public.menu_items;
CREATE POLICY "Admins can delete menu items"
  ON public.menu_items FOR DELETE
  USING (public.is_admin());

-- 7.3 OFFERS POLICIES
DROP POLICY IF EXISTS "Public can read active offers" ON public.offers;
CREATE POLICY "Public can read active offers"
  ON public.offers FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert offers" ON public.offers;
CREATE POLICY "Admins can insert offers"
  ON public.offers FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update offers" ON public.offers;
CREATE POLICY "Admins can update offers"
  ON public.offers FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete offers" ON public.offers;
CREATE POLICY "Admins can delete offers"
  ON public.offers FOR DELETE
  USING (public.is_admin());

-- 7.4 BOOKINGS POLICIES
DROP POLICY IF EXISTS "Public can submit bookings" ON public.bookings;
CREATE POLICY "Public can submit bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  USING (public.is_admin());

-- 7.5 CONTACT MESSAGES POLICIES
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  USING (public.is_admin());

-- 7.6 ADMIN USERS POLICIES
DROP POLICY IF EXISTS "Users can read own admin status" ON public.admin_users;
CREATE POLICY "Users can read own admin status"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- 8. STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view restaurant images" ON storage.objects;
CREATE POLICY "Public can view restaurant images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-images');

DROP POLICY IF EXISTS "Admins can upload restaurant images" ON storage.objects;
CREATE POLICY "Admins can upload restaurant images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'restaurant-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update restaurant images" ON storage.objects;
CREATE POLICY "Admins can update restaurant images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'restaurant-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete restaurant images" ON storage.objects;
CREATE POLICY "Admins can delete restaurant images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'restaurant-images' AND public.is_admin());


-- ==============================================================================
-- 9. INITIAL SEED DATA
-- Sourced directly from verified Surya Restaurant menu
-- ==============================================================================

-- 9.1 SEED CATEGORIES
INSERT INTO public.categories (slug, name, image_url, display_order, is_active) VALUES
  ('non-veg-starters', 'Non-Veg Starters', '/images/menu/chilli-chicken.jpg', 1, true),
  ('egg-starters', 'Egg Starters', NULL, 2, true),
  ('mutton-starters', 'Mutton Starters', NULL, 3, true),
  ('seafood-starters', 'Seafood Starters', '/images/menu/seafood-platter.jpg', 4, true),
  ('veg-starters', 'Veg Starters', '/images/menu/paneer-butter-masala.jpg', 5, true),
  ('biryani', 'Biryani', '/images/menu/chicken-biryani.jpg', 6, true),
  ('tandoori-breads', 'Tandoori Breads', '/images/menu/naan-breads.jpg', 7, true),
  ('bbq-grill', 'BBQ & Grill', '/images/menu/bbq-chicken.jpg', 8, true),
  ('meals', 'Meals', NULL, 9, true),
  ('beverages', 'Fresh Juices & Beverages', '/images/menu/fresh-juices.jpg', 10, true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    image_url = EXCLUDED.image_url,
    display_order = EXCLUDED.display_order;

-- 9.2 SEED MENU ITEMS
DO $$
DECLARE
  cat_nv UUID;
  cat_egg UUID;
  cat_mutton UUID;
  cat_seafood UUID;
  cat_veg UUID;
  cat_biryani UUID;
  cat_breads UUID;
  cat_bbq UUID;
  cat_meals UUID;
  cat_bev UUID;
BEGIN
  SELECT id INTO cat_nv FROM public.categories WHERE slug = 'non-veg-starters';
  SELECT id INTO cat_egg FROM public.categories WHERE slug = 'egg-starters';
  SELECT id INTO cat_mutton FROM public.categories WHERE slug = 'mutton-starters';
  SELECT id INTO cat_seafood FROM public.categories WHERE slug = 'seafood-starters';
  SELECT id INTO cat_veg FROM public.categories WHERE slug = 'veg-starters';
  SELECT id INTO cat_biryani FROM public.categories WHERE slug = 'biryani';
  SELECT id INTO cat_breads FROM public.categories WHERE slug = 'tandoori-breads';
  SELECT id INTO cat_bbq FROM public.categories WHERE slug = 'bbq-grill';
  SELECT id INTO cat_meals FROM public.categories WHERE slug = 'meals';
  SELECT id INTO cat_bev FROM public.categories WHERE slug = 'beverages';

  -- Non-Veg Starters
  INSERT INTO public.menu_items (category_id, name, price, diet, is_popular, display_order) VALUES
    (cat_nv, 'Chicken Lollipop', 159, 'non-veg', true, 1),
    (cat_nv, 'Chicken 65 Bone', 149, 'non-veg', true, 2),
    (cat_nv, 'Chicken 65 Boneless', 179, 'non-veg', false, 3),
    (cat_nv, 'Dragon Chicken', 179, 'non-veg', false, 4),
    (cat_nv, 'Garlic Chicken', 179, 'non-veg', false, 5),
    (cat_nv, 'Szechuan Chicken', 179, 'non-veg', false, 6),
    (cat_nv, 'Apollo Chicken', 179, 'non-veg', false, 7),
    (cat_nv, 'Chilli Chicken', 159, 'non-veg', true, 8),
    (cat_nv, 'Chicken Manchurian', 179, 'non-veg', false, 9),
    (cat_nv, 'Chicken Salt & Pepper', 179, 'non-veg', false, 10),
    (cat_nv, 'Ginger Chicken', 179, 'non-veg', false, 11),
    (cat_nv, 'Saucy Chicken Lollipop', 179, 'non-veg', false, 12),
    (cat_nv, 'Japan Chicken', 199, 'non-veg', false, 13),
    (cat_nv, 'Orange Chicken', 199, 'non-veg', false, 14),
    (cat_nv, 'Lemon Chicken', 199, 'non-veg', false, 15),
    (cat_nv, 'Crispy Chicken Pakoda B/L', 199, 'non-veg', false, 16),
    (cat_nv, 'Curry Leaves Chicken (65)', 199, 'non-veg', false, 17),
    (cat_nv, 'Coriander Chicken 65', 199, 'non-veg', false, 18),
    (cat_nv, 'Chicken 555', 199, 'non-veg', false, 19),
    (cat_nv, 'Finger Chicken', 249, 'non-veg', false, 20),
    (cat_nv, 'Drum Stick Chicken', 349, 'non-veg', false, 21),
    (cat_nv, 'Mur Mur Chicken', 199, 'non-veg', false, 22),
    (cat_nv, 'Honey Garlic Chicken', 199, 'non-veg', false, 23),
    (cat_nv, 'Guntur Chicken', 199, 'non-veg', false, 24),
    (cat_nv, 'Chicken Pepper Fry', 179, 'non-veg', false, 25);

  -- Egg Starters
  INSERT INTO public.menu_items (category_id, name, price, diet, is_popular, display_order) VALUES
    (cat_egg, 'Boiled Egg', 15, 'egg', false, 1),
    (cat_egg, 'Masala Omelette', 40, 'egg', false, 2),
    (cat_egg, 'Egg Podimas', 40, 'egg', false, 3),
    (cat_egg, 'Egg Masala', 129, 'egg', false, 4),
    (cat_egg, 'Chilli Egg', 149, 'egg', false, 5),
    (cat_egg, 'Egg Manchurian', 149, 'egg', false, 6),
    (cat_egg, 'Egg Pepper Fry', 149, 'egg', false, 7),
    (cat_egg, 'Stem Omelette', 40, 'egg', false, 8);

  -- Mutton Starters
  INSERT INTO public.menu_items (category_id, name, price, diet, is_popular, display_order) VALUES
    (cat_mutton, 'Mutton Chukka', 249, 'non-veg', true, 1),
    (cat_mutton, 'Mutton Pepper Fry', 249, 'non-veg', false, 2),
    (cat_mutton, 'Mutton Ghee Roast', 249, 'non-veg', false, 3),
    (cat_mutton, 'Tawa Mutton', 249, 'non-veg', false, 4),
    (cat_mutton, 'Chilli Mutton', 249, 'non-veg', false, 5),
    (cat_mutton, 'Mutton Manchurian', 249, 'non-veg', false, 6);

  -- Seafood Starters
  INSERT INTO public.menu_items (category_id, name, price, diet, is_popular, display_order) VALUES
    (cat_seafood, 'Prawn Pepper Fry', 249, 'non-veg', false, 1),
    (cat_seafood, 'Prawn 65', 249, 'non-veg', false, 2),
    (cat_seafood, 'Chilli Prawn', 249, 'non-veg', false, 3),
    (cat_seafood, 'Prawn Manchurian', 249, 'non-veg', false, 4),
    (cat_seafood, 'Garlic Prawn', 249, 'non-veg', false, 5),
    (cat_seafood, 'Dragon Prawn', 249, 'non-veg', false, 6),
    (cat_seafood, 'Honey Garlic Prawn', 259, 'non-veg', false, 7),
    (cat_seafood, 'Crab Lollipop', 249, 'non-veg', false, 8),
    (cat_seafood, 'Fish Finger', 249, 'non-veg', false, 9),
    (cat_seafood, 'Chilli Fish', 249, 'non-veg', false, 10),
    (cat_seafood, 'Garlic Fish', 249, 'non-veg', false, 11),
    (cat_seafood, 'Dragon Fish', 249, 'non-veg', false, 12),
    (cat_seafood, 'Fish Salt & Pepper', 249, 'non-veg', false, 13),
    (cat_seafood, 'Fish 65', 249, 'non-veg', false, 14),
    (cat_seafood, 'Crab Pepper Fry', 299, 'non-veg', false, 15),
    (cat_seafood, 'Vanjaram Fish Fry', 249, 'non-veg', false, 16),
    (cat_seafood, 'Apollo Fish', 249, 'non-veg', false, 17);

  -- Veg Starters
  INSERT INTO public.menu_items (category_id, name, price, diet, is_popular, display_order) VALUES
    (cat_veg, 'Gobi 65', 129, 'veg', false, 1),
    (cat_veg, 'Gobi Manchurian', 129, 'veg', false, 2),
    (cat_veg, 'Mushroom 65', 149, 'veg', false, 3),
    (cat_veg, 'Mushroom Manchurian', 149, 'veg', false, 4),
    (cat_veg, 'Paneer 65', 179, 'veg', true, 5),
    (cat_veg, 'Paneer Manchurian', 179, 'veg', false, 6),
    (cat_veg, 'Chilli Paneer', 179, 'veg', false, 7),
    (cat_veg, 'Dragon Paneer', 179, 'veg', false, 8),
    (cat_veg, 'Veg Manchurian', 129, 'veg', false, 9),
    (cat_veg, 'Chilli Gobi', 129, 'veg', false, 10),
    (cat_veg, 'Baby Corn 65', 149, 'veg', false, 11),
    (cat_veg, 'Baby Corn Manchurian', 149, 'veg', false, 12),
    (cat_veg, 'Crispy Corn', 149, 'veg', false, 13),
    (cat_veg, 'Mushroom Pepper Fry', 149, 'veg', false, 14),
    (cat_veg, 'Paneer Salt & Pepper', 179, 'veg', false, 15),
    (cat_veg, 'Garlic Mushroom', 149, 'veg', false, 16);

  -- Biryani
  INSERT INTO public.menu_items (category_id, name, price, diet, is_popular, display_order) VALUES
    (cat_biryani, 'Chicken Biryani', 179, 'non-veg', true, 1),
    (cat_biryani, 'Chicken Dum Biryani', 199, 'non-veg', true, 2),
    (cat_biryani, 'Mutton Biryani', 249, 'non-veg', true, 3),
    (cat_biryani, 'Mutton Dum Biryani', 269, 'non-veg', false, 4),
    (cat_biryani, 'Prawn Biryani', 249, 'non-veg', false, 5),
    (cat_biryani, 'Fish Biryani', 249, 'non-veg', false, 6),
    (cat_biryani, 'Egg Biryani', 149, 'egg', false, 7),
    (cat_biryani, 'Veg Biryani', 149, 'veg', false, 8),
    (cat_biryani, 'Veg Dum Biryani', 169, 'veg', false, 9),
    (cat_biryani, 'Paneer Biryani', 179, 'veg', false, 10),
    (cat_biryani, 'Mushroom Biryani', 169, 'veg', false, 11),
    (cat_biryani, 'Chicken 65 Biryani', 219, 'non-veg', false, 12),
    (cat_biryani, 'Spl Chicken Biryani', 219, 'non-veg', false, 13),
    (cat_biryani, 'Boneless Chicken Biryani', 219, 'non-veg', false, 14);

  -- Tandoori Breads
  INSERT INTO public.menu_items (category_id, name, price, diet, is_popular, display_order) VALUES
    (cat_breads, 'Tandoori Roti', 30, 'veg', false, 1),
    (cat_breads, 'Butter Roti', 40, 'veg', false, 2),
    (cat_breads, 'Butter Naan', 50, 'veg', true, 3),
    (cat_breads, 'Plain Naan', 40, 'veg', false, 4),
    (cat_breads, 'Garlic Naan', 50, 'veg', true, 5),
    (cat_breads, 'Masala Kulcha', 60, 'veg', false, 6),
    (cat_breads, 'Plain Kulcha', 40, 'veg', false, 7),
    (cat_breads, 'Aloo Kulcha', 60, 'veg', false, 8),
    (cat_breads, 'Aloo Paratha', 60, 'veg', false, 9),
    (cat_breads, 'Gobi Paratha', 60, 'veg', false, 10),
    (cat_breads, 'Onion Kulcha', 60, 'veg', false, 11),
    (cat_breads, 'Paneer Kulcha', 60, 'veg', false, 12),
    (cat_breads, 'Paneer Paratha', 60, 'veg', false, 13),
    (cat_breads, 'Butter Kulcha', 60, 'veg', false, 14),
    (cat_breads, 'Chicken Kulcha', 60, 'non-veg', false, 15),
    (cat_breads, 'Chicken Paratha', 60, 'non-veg', false, 16),
    (cat_breads, 'Mutton Kulcha', 80, 'non-veg', false, 17),
    (cat_breads, 'Mutton Paratha', 80, 'non-veg', false, 18),
    (cat_breads, 'Laccha Paratha', 60, 'veg', false, 19),
    (cat_breads, 'Chappathi', 50, 'veg', false, 20),
    (cat_breads, 'Pulka', 50, 'veg', false, 21);

  -- BBQ & Grill
  INSERT INTO public.menu_items (category_id, name, price, price_label, diet, is_popular, display_order) VALUES
    (cat_bbq, 'BBQ Chicken', 129, '129 / 249 / 449', 'non-veg', true, 1),
    (cat_bbq, 'Pepper BBQ', 129, '129 / 249 / 449', 'non-veg', false, 2),
    (cat_bbq, 'Lemon BBQ', 129, '129 / 249 / 449', 'non-veg', false, 3),
    (cat_bbq, 'Hot and Spicy BBQ', 129, '129 / 249 / 449', 'non-veg', false, 4),
    (cat_bbq, 'Grill Chicken', 299, '299 / 499', 'non-veg', false, 5),
    (cat_bbq, 'Pepper Grill Chicken', 249, '249 / 449', 'non-veg', false, 6);

  -- Meals
  INSERT INTO public.menu_items (category_id, name, price, diet, is_popular, display_order) VALUES
    (cat_meals, 'Veg Meals (Dining)', 119, 'veg', false, 1),
    (cat_meals, 'Veg Meals (Parcel)', 99, 'veg', false, 2),
    (cat_meals, 'Non-Veg Meals (Dining)', 159, 'non-veg', false, 3),
    (cat_meals, 'Non-Veg Meals (Parcel)', 149, 'non-veg', false, 4);

  -- Fresh Juices & Beverages
  INSERT INTO public.menu_items (category_id, name, price, diet, is_popular, display_order) VALUES
    (cat_bev, 'Watermelon Juice', 60, 'veg', false, 1),
    (cat_bev, 'Grape Juice', 80, 'veg', false, 2),
    (cat_bev, 'Muskmelon Juice', 80, 'veg', false, 3),
    (cat_bev, 'Apple Juice', 100, 'veg', false, 4),
    (cat_bev, 'Pineapple Juice', 80, 'veg', false, 5),
    (cat_bev, 'Orange Juice', 80, 'veg', false, 6),
    (cat_bev, 'Pomegranate Juice', 100, 'veg', false, 7),
    (cat_bev, 'Sweet Lemon Juice', 80, 'veg', false, 8),
    (cat_bev, 'Mango Juice', 100, 'veg', false, 9),
    (cat_bev, 'Fig Juice', 100, 'veg', false, 10),
    (cat_bev, 'Kiwi Juice', 100, 'veg', false, 11),
    (cat_bev, 'Avocado Juice', 100, 'veg', false, 12),
    (cat_bev, 'Papaya Juice', 60, 'veg', false, 13),
    (cat_bev, 'Chikku Juice', 80, 'veg', false, 14),
    (cat_bev, 'Rose Milk', 40, 'veg', false, 15),
    (cat_bev, 'Beetroot Juice', 60, 'veg', false, 16),
    (cat_bev, 'Gooseberry Juice', 60, 'veg', false, 17),
    (cat_bev, 'Dragon Fruit Juice', 100, 'veg', false, 18),
    (cat_bev, 'Strawberry Juice', 100, 'veg', false, 19),
    (cat_bev, 'Badam Milk', 50, 'veg', false, 20),
    (cat_bev, 'Butter Milk', 40, 'veg', false, 21),
    (cat_bev, 'Sweet Lassi', 50, 'veg', false, 22),
    (cat_bev, 'Salt Lassi', 40, 'veg', false, 23),
    (cat_bev, 'Lemon Soda', 50, 'veg', false, 24),
    (cat_bev, 'Lemon Mint Soda', 60, 'veg', false, 25),
    (cat_bev, 'Lemon Juice', 40, 'veg', false, 26),
    (cat_bev, 'Lemon Mint Juice', 50, 'veg', false, 27),
    (cat_bev, 'Lemon Mint Mojito', 80, 'veg', false, 28),
    (cat_bev, 'Blue Curacao Mojito', 100, 'veg', false, 29),
    (cat_bev, 'Watermelon Mojito', 120, 'veg', false, 30),
    (cat_bev, 'Strawberry Mojito', 120, 'veg', false, 31);
END $$;

-- 9.3 SEED OFFERS & PROMOTIONS
INSERT INTO public.offers (title, description, discount_tag, start_date, end_date, is_active) VALUES
  ('Weekend Biryani Special', 'Get a complimentary Fresh Lime Soda with every Mutton or Chicken Dum Biryani ordered on weekends!', 'FREE DRINK', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
  ('Family Dining Combo', '15% discount on table bookings for 5 or more guests. Experience fine multicuisine dining in AC comfort.', '15% OFF', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
  ('Tandoori & BBQ Delight', 'Order 2 BBQ or Tandoori platters and enjoy hot Butter Naan on the house!', 'CHEF SPECIAL', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true);

-- 10. HELPER QUERY TO PROMOTE A USER TO ADMIN:
-- To make a registered user an administrator, run:
-- INSERT INTO public.admin_users (id, role)
-- VALUES ('<YOUR_SUPABASE_USER_UID>', 'superadmin')
-- ON CONFLICT (id) DO NOTHING;
