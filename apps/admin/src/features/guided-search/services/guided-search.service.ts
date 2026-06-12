import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { GuidedSearchRequest, Profile, School, GuidedSearchStatus } from '@dakareaseu/types';

export interface GuidedSearchRequestWithRelations extends GuidedSearchRequest {
  student: Pick<Profile, 'id' | 'full_name' | 'phone'> | null;
  school: Pick<School, 'id' | 'name' | 'district'> | null;
}

export interface GuidedSearchFilters {
  status?: GuidedSearchStatus | 'all';
}

export async function fetchGuidedSearchRequests(
  filters: GuidedSearchFilters,
): Promise<GuidedSearchRequestWithRelations[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from('guided_search_requests')
    .select('*, student:profiles(id, full_name, phone), school:schools(id, name, district)')
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as GuidedSearchRequestWithRelations[];
}

export async function fetchGuidedSearchRequestDetail(
  id: string,
): Promise<GuidedSearchRequestWithRelations> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('guided_search_requests')
    .select('*, student:profiles(id, full_name, phone), school:schools(id, name, district)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as GuidedSearchRequestWithRelations;
}

export async function setGuidedSearchStatus(id: string, status: GuidedSearchStatus): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('guided_search_requests').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function fetchMatchesForRequest(request: GuidedSearchRequest) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc('match_listings', {
    p_type: request.housing_type,
    p_budget: request.budget,
    p_school_id: request.school_id ?? undefined,
    p_district: request.district ?? undefined,
    p_furnished: request.furnished_pref ?? undefined,
    p_coloc: request.coloc_pref,
    p_months: request.duration_months,
  });
  if (error) throw error;
  return data.slice(0, 5);
}
