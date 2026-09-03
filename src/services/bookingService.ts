import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { BookingRow, BookingStatus } from '../types/database';

export interface CreateBookingInput {
  customer_name: string;
  phone: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  message?: string;
}

/**
 * Public: Customer submits a booking request
 */
export const createBooking = async (input: CreateBookingInput): Promise<{ success: boolean; id?: string }> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Simulating booking submission in demo mode.');
    // Simulated success so customer flow still completes nicely when testing without Supabase credentials
    return { success: true, id: 'demo-' + Date.now() };
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        customer_name: input.customer_name.trim(),
        phone: input.phone.trim(),
        booking_date: input.booking_date,
        booking_time: input.booking_time,
        guests: input.guests,
        message: input.message?.trim() || null,
        status: 'pending',
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Booking submission error:', error);
    throw new Error('Unable to submit booking request. Please try again or call us directly.');
  }

  return { success: true, id: data?.id };
};

/**
 * Admin: Fetch all bookings with optional filters
 */
export const fetchBookings = async (options?: {
  status?: BookingStatus | 'all';
  date?: string;
}): Promise<BookingRow[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  let query = supabase
    .from('bookings')
    .select('*')
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true });

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.date) {
    query = query.eq('booking_date', options.date);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Admin: Update status of a booking
 */
export const updateBookingStatus = async (
  id: string,
  status: BookingStatus
): Promise<BookingRow> => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Admin: Delete booking
 */
export const deleteBooking = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
};
