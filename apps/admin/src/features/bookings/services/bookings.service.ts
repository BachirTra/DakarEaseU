import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Booking, Listing, Profile, BookingStatus, PaymentStatus } from '@dakareaseu/types';

export interface BookingWithRelations extends Booking {
  listing: Pick<Listing, 'id' | 'title' | 'district'> | null;
  renter: Pick<Profile, 'id' | 'full_name' | 'phone'> | null;
}

export interface BookingsFilters {
  status?: BookingStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
}

export async function fetchBookings(filters: BookingsFilters): Promise<BookingWithRelations[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from('bookings')
    .select('*, listing:listings(id, title, district), renter:profiles(id, full_name, phone)')
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters.paymentStatus && filters.paymentStatus !== 'all')
    query = query.eq('payment_status', filters.paymentStatus);

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as BookingWithRelations[];
}

export async function fetchBookingDetail(id: string): Promise<BookingWithRelations> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, listing:listings(id, title, district), renter:profiles(id, full_name, phone)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as BookingWithRelations;
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) throw error;
}
