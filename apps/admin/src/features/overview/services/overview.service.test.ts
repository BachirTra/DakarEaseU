import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchOverviewStats } from './overview.service';

const countResult = (count: number) => ({ count, error: null });

const selectChain = (count: number) => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => Promise.resolve(countResult(count)));
  chain.gte = vi.fn(() => Promise.resolve(countResult(count)));
  return chain;
};

vi.mock('@/lib/supabase/browser-client', () => ({
  createSupabaseBrowserClient: () => ({
    from: vi.fn((table: string) => {
      const counts: Record<string, number> = {
        listings: 3,
        profiles: 5,
        guided_search_requests: 2,
        bookings: 11,
      };
      return selectChain(counts[table] ?? 0);
    }),
  }),
}));

describe('fetchOverviewStats', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps each count query to the correct stat field', async () => {
    const stats = await fetchOverviewStats();
    expect(stats).toEqual({
      pendingListings: 3,
      pendingVerifications: 5,
      openGuidedSearchRequests: 2,
      recentBookingsCount: 11,
    });
  });
});
