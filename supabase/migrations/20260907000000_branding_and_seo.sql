-- ==============================================================================
-- SURYA MULTICUISINE RESTAURANT & CAFE
-- Migration: Dynamic Branding, SEO & Contact Information in restaurant_settings
-- ==============================================================================

ALTER TABLE public.restaurant_settings
  ADD COLUMN IF NOT EXISTS site_name TEXT DEFAULT 'Surya Multicuisine Restaurant & Cafe',
  ADD COLUMN IF NOT EXISTS site_short_name TEXT DEFAULT 'Surya',
  ADD COLUMN IF NOT EXISTS site_tagline TEXT DEFAULT 'Multicuisine Restaurant & Cafe',
  ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '/images/branding/logo.svg',
  ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT 'Surya Multicuisine Restaurant & Cafe | Ambattur, Chennai',
  ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Surya Multicuisine Restaurant & Cafe located at 97, Vanagaram High Rd, Ambattur, Chennai. Serving delicious Biryani, Tandoori, Chinese, Seafood, BBQ & North Indian specialties. Dine-in, takeaway, delivery.',
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT DEFAULT 'Surya Multicuisine Restaurant Chennai, Surya Multicuisine Restaurant Ambattur, Multicuisine restaurant in Ambattur, Biryani Ambattur, Tandoori Ambattur',
  ADD COLUMN IF NOT EXISTS og_image_url TEXT DEFAULT '/images/restaurant/hero-food-spread.jpg',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '+918015553780',
  ADD COLUMN IF NOT EXISTS contact_phone_display TEXT DEFAULT '+91 80155 53780',
  ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT DEFAULT '+918015553780',
  ADD COLUMN IF NOT EXISTS address_full TEXT DEFAULT '97, Vanagaram High Road, Sivananda Nagar, Ambattur, Chennai, Tamil Nadu 600053',
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT DEFAULT 'https://www.google.com/maps/search/Surya+Multicuisine+Restaurant+Ambattur+Chennai',
  ADD COLUMN IF NOT EXISTS operating_hours TEXT DEFAULT '11:00 AM – 11:00 PM';

-- Update existing 'default' record with initial values if null
UPDATE public.restaurant_settings
SET
  site_name = COALESCE(site_name, 'Surya Multicuisine Restaurant & Cafe'),
  site_short_name = COALESCE(site_short_name, 'Surya'),
  site_tagline = COALESCE(site_tagline, 'Multicuisine Restaurant & Cafe'),
  logo_url = COALESCE(logo_url, '/images/branding/logo.svg'),
  seo_title = COALESCE(seo_title, 'Surya Multicuisine Restaurant & Cafe | Ambattur, Chennai'),
  seo_description = COALESCE(seo_description, 'Surya Multicuisine Restaurant & Cafe located at 97, Vanagaram High Rd, Ambattur, Chennai. Serving delicious Biryani, Tandoori, Chinese, Seafood, BBQ & North Indian specialties. Dine-in, takeaway, delivery.'),
  seo_keywords = COALESCE(seo_keywords, 'Surya Multicuisine Restaurant Chennai, Surya Multicuisine Restaurant Ambattur, Multicuisine restaurant in Ambattur, Biryani Ambattur, Tandoori Ambattur'),
  og_image_url = COALESCE(og_image_url, '/images/restaurant/hero-food-spread.jpg'),
  contact_phone = COALESCE(contact_phone, '+918015553780'),
  contact_phone_display = COALESCE(contact_phone_display, '+91 80155 53780'),
  contact_whatsapp = COALESCE(contact_whatsapp, '+918015553780'),
  address_full = COALESCE(address_full, '97, Vanagaram High Road, Sivananda Nagar, Ambattur, Chennai, Tamil Nadu 600053'),
  google_maps_url = COALESCE(google_maps_url, 'https://www.google.com/maps/search/Surya+Multicuisine+Restaurant+Ambattur+Chennai'),
  operating_hours = COALESCE(operating_hours, '11:00 AM – 11:00 PM')
WHERE id = 'default';
