import { useMutation, useQuery } from '@tanstack/react-query';
import * as guidedSearchService from '@/features/housing/services/guidedSearch.service';
import * as listingsService from '@/features/housing/services/listings.service';
import type { GuidedSearchInput } from '@/features/housing/schemas/guidedSearchSchemas';
import type { MatchListingsArgs } from '@dakareaseu/types';

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
