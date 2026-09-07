import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RestaurantSettingsRow } from '../types/database';

export const DEFAULT_SETTINGS: RestaurantSettingsRow = {
  id: 'default',
  is_ordering_enabled: true,
  is_delivery_enabled: true,
  min_order_amount: 200,
  delivery_fee: 0,
  delivery_radius_km: 3.0,
  currency: 'INR',
  restaurant_email: 'suryamulticuisine@gmail.com',
  customer_email_notifications: true,
  // Branding & Identity
  site_name: 'Surya Multicuisine Restaurant & Cafe',
  site_short_name: 'Surya',
  site_tagline: 'Multicuisine Restaurant & Cafe',
  logo_url: '/images/branding/logo.svg',
  // SEO & Social Preview
  seo_title: 'Surya Multicuisine Restaurant & Cafe | Ambattur, Chennai',
  seo_description: 'Surya Multicuisine Restaurant & Cafe located at 97, Vanagaram High Rd, Ambattur, Chennai. Serving delicious Biryani, Tandoori, Chinese, Seafood, BBQ & North Indian specialties. Dine-in, takeaway, delivery.',
  seo_keywords: 'Surya Multicuisine Restaurant Chennai, Surya Multicuisine Restaurant Ambattur, Multicuisine restaurant in Ambattur, Biryani Ambattur, Tandoori Ambattur',
  og_image_url: '/images/restaurant/hero-food-spread.jpg',
  // Contact & Location
  contact_phone: '+918015553780',
  contact_phone_display: '+91 80155 53780',
  contact_whatsapp: '+918015553780',
  address_full: '97, Vanagaram High Road, Sivananda Nagar, Ambattur, Chennai, Tamil Nadu 600053',
  google_maps_url: 'https://www.google.com/maps/search/Surya+Multicuisine+Restaurant+Ambattur+Chennai',
  operating_hours: '11:00 AM – 11:00 PM',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// In-memory/localStorage fallback cache for offline or pre-migration testing
const SETTINGS_STORAGE_KEY = 'surya_restaurant_settings_cache';

export const getCachedSettings = (): RestaurantSettingsRow => {
  try {
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (cached) return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_SETTINGS;
};

export const SETTINGS_UPDATED_EVENT = 'surya_settings_updated';

const setCachedSettings = (settings: RestaurantSettingsRow) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    localStorage.setItem('surya_settings_timestamp', Date.now().toString());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: settings }));
    }
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Fetch restaurant settings (delivery fee, minimum order, branding, SEO)
 */
export const fetchRestaurantSettings = async (): Promise<RestaurantSettingsRow> => {
  if (!isSupabaseConfigured()) {
    return getCachedSettings();
  }

  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch restaurant_settings from Supabase, using cached/default:', error.message);
      return getCachedSettings();
    }

    if (data) {
      const cached = getCachedSettings();
      const parsed: RestaurantSettingsRow = {
        ...DEFAULT_SETTINGS,
        ...cached,
        ...data,
        min_order_amount: Number(data.min_order_amount ?? DEFAULT_SETTINGS.min_order_amount),
        delivery_fee: Number(data.delivery_fee ?? DEFAULT_SETTINGS.delivery_fee),
        delivery_radius_km: Number(data.delivery_radius_km ?? DEFAULT_SETTINGS.delivery_radius_km),
      };
      setCachedSettings(parsed);
      return parsed;
    }

    return getCachedSettings();
  } catch (err) {
    console.warn('Unexpected error fetching restaurant settings:', err);
    return getCachedSettings();
  }
};

/**
 * Admin: Update restaurant settings (Branding, SEO, Delivery, Alerts)
 */
export const updateRestaurantSettings = async (
  updates: Partial<Omit<RestaurantSettingsRow, 'id' | 'created_at' | 'updated_at'>>
): Promise<RestaurantSettingsRow> => {
  const current = getCachedSettings();
  const localUpdated: RestaurantSettingsRow = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Broadcast & update cache immediately
  setCachedSettings(localUpdated);

  if (!isSupabaseConfigured()) {
    return localUpdated;
  }

  try {
    // 1. Attempt full upsert including any new columns
    const { data, error } = await supabase
      .from('restaurant_settings')
      .upsert({
        id: 'default',
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase full update failed, falling back to base columns:', error.message);

      // If columns like site_name aren't in Supabase schema cache yet, save core columns so delivery fee works
      const baseKeys = [
        'is_ordering_enabled',
        'is_delivery_enabled',
        'min_order_amount',
        'delivery_fee',
        'delivery_radius_km',
        'currency',
        'restaurant_email',
        'customer_email_notifications',
      ] as const;

      const baseUpdates: Record<string, unknown> = { id: 'default', updated_at: new Date().toISOString() };
      for (const key of baseKeys) {
        if (key in updates) {
          baseUpdates[key] = (updates as Record<string, unknown>)[key];
        }
      }

      await supabase
        .from('restaurant_settings')
        .upsert(baseUpdates)
        .select()
        .single();

      return localUpdated;
    }

    const parsed: RestaurantSettingsRow = {
      ...localUpdated,
      ...data,
      min_order_amount: Number(data.min_order_amount),
      delivery_fee: Number(data.delivery_fee),
      delivery_radius_km: Number(data.delivery_radius_km),
    };
    setCachedSettings(parsed);
    return parsed;
  } catch (err: unknown) {
    console.error('Error updating restaurant settings:', err);
    return localUpdated;
  }
};

