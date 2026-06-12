import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Listing, ListingType, Enums } from '@dakareaseu/types';

export type ListingVerificationStatus = Enums<'listing_verification_status'>;

export interface ListingsFilters {
  verificationStatus?: ListingVerificationStatus | 'all';
  district?: string | 'all';
  type?: ListingType | 'all';
}

export async function fetchListings(filters: ListingsFilters): Promise<Listing[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase.from('listings').select('*').order('created_at', { ascending: false });

  if (filters.verificationStatus && filters.verificationStatus !== 'all') {
    query = query.eq('verification_status', filters.verificationStatus);
  }
  if (filters.district && filters.district !== 'all') {
    query = query.eq('district', filters.district);
  }
  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchListingDistricts(): Promise<string[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('listings').select('district');
  if (error) throw error;
  return Array.from(new Set(data.map((row) => row.district))).sort();
}

export async function updateListingVerificationStatus(
  id: string,
  status: ListingVerificationStatus,
) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('listings')
    .update({ verification_status: status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteListing(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}
