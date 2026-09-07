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
 * Fetch restaurant settings (delivery fee, minimum order, etc.)
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
      const parsed: RestaurantSettingsRow = {
        ...data,
        min_order_amount: Number(data.min_order_amount),
        delivery_fee: Number(data.delivery_fee),
        delivery_radius_km: Number(data.delivery_radius_km),
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
 * Admin: Update restaurant ordering settings
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

  if (!isSupabaseConfigured()) {
    setCachedSettings(localUpdated);
    return localUpdated;
  }

  try {
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
      console.warn('Supabase update restaurant_settings failed:', error.message);
      setCachedSettings(localUpdated);
      return localUpdated;
    }

    const parsed: RestaurantSettingsRow = {
      ...data,
      min_order_amount: Number(data.min_order_amount),
      delivery_fee: Number(data.delivery_fee),
      delivery_radius_km: Number(data.delivery_radius_km),
    };
    setCachedSettings(parsed);
    return parsed;
  } catch (err: unknown) {
    console.error('Error updating restaurant settings:', err);
    setCachedSettings(localUpdated);
    return localUpdated;
  }
};

