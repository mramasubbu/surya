import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CategoryRow, MenuItemRow, CategoryWithItems } from '../types/database';
import { menuCategories as fallbackCategories } from '../data/menu';

// Convert static fallback menu items to CategoryWithItems format
const getFallbackCategoriesWithItems = (): CategoryWithItems[] => {
  return fallbackCategories.map((cat, catIdx) => ({
    id: cat.id,
    slug: cat.id,
    name: cat.name,
    image_url: cat.image || null,
    display_order: catIdx + 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: cat.items.map((item, itemIdx) => ({
      id: item.id,
      category_id: cat.id,
      name: item.name,
      description: item.description || null,
      price: item.price,
      price_label: item.priceLabel || null,
      diet: item.diet,
      image_url: item.image || null,
      is_popular: Boolean(item.popular),
      is_available: true,
      is_active: true,
      display_order: itemIdx + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  }));
};

/**
 * Fetch all categories with their associated items
 */
export const fetchMenuWithCategories = async (
  includeInactive = false
): Promise<CategoryWithItems[]> => {
  if (!isSupabaseConfigured()) {
    return getFallbackCategoriesWithItems();
  }

  try {
    let catQuery = supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (!includeInactive) {
      catQuery = catQuery.eq('is_active', true);
    }

    const { data: categories, error: catError } = await catQuery;

    if (catError) {
      console.warn('Supabase categories fetch error, falling back to static:', catError.message);
      return getFallbackCategoriesWithItems();
    }

    if (!categories || categories.length === 0) {
      return getFallbackCategoriesWithItems();
    }

    let itemsQuery = supabase
      .from('menu_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (!includeInactive) {
      itemsQuery = itemsQuery.eq('is_active', true);
    }

    const { data: items, error: itemsError } = await itemsQuery;

    if (itemsError) {
      console.warn('Supabase menu_items fetch error, falling back to static:', itemsError.message);
      return getFallbackCategoriesWithItems();
    }

    // Map items into their respective categories
    const categoriesWithItems: CategoryWithItems[] = categories.map((cat) => ({
      ...cat,
      items: (items || []).filter((item) => item.category_id === cat.id),
    }));

    return categoriesWithItems;
  } catch (err) {
    console.error('Unexpected error fetching menu:', err);
    return getFallbackCategoriesWithItems();
  }
};

/**
 * Fetch popular menu items
 */
export const fetchPopularMenuItems = async (): Promise<MenuItemRow[]> => {
  if (!isSupabaseConfigured()) {
    const all = getFallbackCategoriesWithItems().flatMap((c) => c.items);
    return all.filter((i) => i.is_popular).slice(0, 6);
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .eq('is_popular', true)
      .limit(6);

    if (error) {
      console.warn('Error fetching popular items from Supabase:', error.message);
      const all = getFallbackCategoriesWithItems().flatMap((c) => c.items);
      return all.filter((i) => i.is_popular).slice(0, 6);
    }

    if (data && data.length > 0) {
      return data;
    }

    // If no items are marked popular in database, return top 6 active dishes from database
    const { data: firstSix, error: err2 } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .limit(6);

    if (err2 || !firstSix || firstSix.length === 0) {
      const all = getFallbackCategoriesWithItems().flatMap((c) => c.items);
      return all.filter((i) => i.is_popular).slice(0, 6);
    }

    return firstSix;
  } catch {
    const all = getFallbackCategoriesWithItems().flatMap((c) => c.items);
    return all.filter((i) => i.is_popular).slice(0, 6);
  }
};

/**
 * Admin: Category CRUD
 */
export const createCategory = async (
  category: Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>
) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CategoryRow;
};

export const updateCategory = async (
  id: string,
  updates: Partial<Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>>
) => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CategoryRow;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
};

/**
 * Admin: Menu Item CRUD
 */
export const createMenuItem = async (
  item: Omit<MenuItemRow, 'id' | 'created_at' | 'updated_at'>
) => {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([item])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as MenuItemRow;
};

export const updateMenuItem = async (
  id: string,
  updates: Partial<Omit<MenuItemRow, 'id' | 'created_at' | 'updated_at'>>
) => {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as MenuItemRow;
};

export const deleteMenuItem = async (id: string) => {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
};

export const toggleItemAvailability = async (id: string, is_available: boolean) => {
  return updateMenuItem(id, { is_available });
};
