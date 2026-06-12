import { supabase } from '@/lib/supabase';
import {
  LISTING_PUBLIC_COLUMNS,
  type ListingFilters,
} from '@/features/housing/types/housing.types';
import type { MatchListingsArgs, MatchResult } from '@dakareaseu/types';

export async function fetchListings(filters: ListingFilters = {}) {
  let query = supabase
    .from('listings')
    .select(`${LISTING_PUBLIC_COLUMNS}, listing_media(id, url, media_type, position)` as const)
    .eq('verification_status', 'published')
    .order('created_at', { ascending: false });

  if (filters.type && filters.type !== 'any') query = query.eq('type', filters.type);
  if (typeof filters.maxPrice === 'number') query = query.lte('price', filters.maxPrice);
  if (filters.district) query = query.eq('district', filters.district);
  if (typeof filters.furnished === 'boolean') query = query.eq('furnished', filters.furnished);
  if (filters.colocationOnly) query = query.eq('colocation_available', true);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchListingDetail(listingId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `${LISTING_PUBLIC_COLUMNS}, listing_media(id, url, media_type, position), listing_coliving_rooms(id, label, price, surface_m2, is_available)` as const,
    )
    .eq('id', listingId)
    .eq('verification_status', 'published')
    .single();
  if (error) throw error;
  return data;
}

export async function matchListings(args: MatchListingsArgs): Promise<MatchResult[]> {
  const { data, error } = await supabase.rpc('match_listings', args);
  if (error) throw error;
  return data ?? [];
}
