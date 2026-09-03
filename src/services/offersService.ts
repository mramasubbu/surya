import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { OfferRow } from '../types/database';

const fallbackOffers: OfferRow[] = [
  {
    id: 'off-1',
    title: 'Weekend Biryani Special',
    description: 'Get a complimentary Fresh Lime Soda with every Mutton or Chicken Dum Biryani ordered on weekends!',
    discount_tag: 'FREE DRINK',
    start_date: null,
    end_date: null,
    image_url: '/images/menu/chicken-biryani.jpg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'off-2',
    title: 'Family Dining Combo',
    description: '15% discount on table reservations for 5 or more guests. Experience fine multicuisine dining in AC comfort.',
    discount_tag: '15% OFF',
    start_date: null,
    end_date: null,
    image_url: '/images/restaurant/interior-01.jpg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'off-3',
    title: 'Tandoori & BBQ Delight',
    description: 'Order 2 BBQ or Tandoori platters and enjoy hot Butter Naan on the house!',
    discount_tag: 'CHEF SPECIAL',
    start_date: null,
    end_date: null,
    image_url: '/images/menu/bbq-chicken.jpg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Public: Fetch currently active offers
 */
export const fetchActiveOffers = async (): Promise<OfferRow[]> => {
  if (!isSupabaseConfigured()) {
    return fallbackOffers;
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase offers error, using fallback:', error.message);
      return fallbackOffers;
    }

    if (!data || data.length === 0) {
      return fallbackOffers;
    }

    return data;
  } catch {
    return fallbackOffers;
  }
};

/**
 * Admin: Fetch all offers
 */
export const fetchAllOffers = async (): Promise<OfferRow[]> => {
  if (!isSupabaseConfigured()) {
    return fallbackOffers;
  }

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Admin: Create offer
 */
export const createOffer = async (
  offer: Omit<OfferRow, 'id' | 'created_at' | 'updated_at'>
): Promise<OfferRow> => {
  const { data, error } = await supabase
    .from('offers')
    .insert([offer])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Admin: Update offer
 */
export const updateOffer = async (
  id: string,
  updates: Partial<Omit<OfferRow, 'id' | 'created_at' | 'updated_at'>>
): Promise<OfferRow> => {
  const { data, error } = await supabase
    .from('offers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Admin: Delete offer
 */
export const deleteOffer = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('offers').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
};
