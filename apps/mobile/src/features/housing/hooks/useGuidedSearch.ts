import { useMutation, useQuery } from '@tanstack/react-query';
import * as guidedSearchService from '@/features/housing/services/guidedSearch.service';
import * as listingsService from '@/features/housing/services/listings.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import type { GuidedSearchInput } from '@/features/housing/schemas/guidedSearchSchemas';
import type { MatchListingsArgs } from '@dakareaseu/types';

export function useMyGuidedSearchRequests() {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['guided-search', 'list', userId],
    queryFn: () => guidedSearchService.fetchMyGuidedSearchRequests(userId as string),
    enabled: Boolean(userId),
  });
}

export function useSubmitGuidedSearch() {
  return useMutation({
    mutationFn: (params: { userId: string; input: GuidedSearchInput }) =>
      guidedSearchService.createGuidedSearchRequest(params),
  });
}

export function useGuidedSearchMatches(args: MatchListingsArgs | null) {
  return useQuery({
    queryKey: ['listings', 'matches', args],
    queryFn: () => listingsService.matchListings(args as MatchListingsArgs),
    enabled: args !== null,
  });
}
