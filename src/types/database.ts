export type DietType = 'veg' | 'non-veg' | 'egg';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type ContactMessageStatus = 'unread' | 'read' | 'resolved';
export type AdminRole = 'admin' | 'superadmin';

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItemRow {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  price_label: string | null;
  diet: DietType;
  image_url: string | null;
  is_popular: boolean;
  is_available: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OfferRow {
  id: string;
  title: string;
  description: string | null;
  discount_tag: string | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingRow {
  id: string;
  customer_name: string;
  phone: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminUserRow {
  id: string;
  role: AdminRole;
  created_at: string;
}

// Joined types for UI consumption
export interface CategoryWithItems extends CategoryRow {
  items: MenuItemRow[];
}
