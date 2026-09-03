import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ContactMessageRow, ContactMessageStatus } from '../types/database';

export interface SubmitContactInput {
  name: string;
  phone?: string;
  email?: string;
  message: string;
}

/**
 * Public: Submit customer message
 */
export const submitContactMessage = async (
  input: SubmitContactInput
): Promise<{ success: boolean; id?: string }> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Simulating contact message submission in demo mode.');
    return { success: true, id: 'demo-' + Date.now() };
  }

  const { data, error } = await supabase
    .from('contact_messages')
    .insert([
      {
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        message: input.message.trim(),
        status: 'unread',
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Contact message error:', error);
    throw new Error('Unable to send message. Please try again or reach us via phone or WhatsApp.');
  }

  return { success: true, id: data?.id };
};

/**
 * Admin: Fetch messages
 */
export const fetchContactMessages = async (
  status?: ContactMessageStatus | 'all'
): Promise<ContactMessageRow[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  let query = supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Admin: Update message status
 */
export const updateContactMessageStatus = async (
  id: string,
  status: ContactMessageStatus
): Promise<ContactMessageRow> => {
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Admin: Delete contact message
 */
export const deleteContactMessage = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
};
