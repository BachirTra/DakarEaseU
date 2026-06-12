import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';

export interface OverviewStats {
  pendingListings: number;
  pendingVerifications: number;
  openGuidedSearchRequests: number;
  recentBookingsCount: number;
}

export async function fetchOverviewStats(): Promise<OverviewStats> {
  const supabase = createSupabaseBrowserClient();

  const [pendingListings, pendingVerifications, openRequests, recentBookings] = await Promise.all([
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
    supabase
      .from('guided_search_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  for (const result of [pendingListings, pendingVerifications, openRequests, recentBookings]) {
    if (result.error) throw result.error;
  }

  return {
    pendingListings: pendingListings.count ?? 0,
    pendingVerifications: pendingVerifications.count ?? 0,
    openGuidedSearchRequests: openRequests.count ?? 0,
    recentBookingsCount: recentBookings.count ?? 0,
  };
}
