import { useQuery } from "@tanstack/react-query";
import * as listingsService from "@/features/housing/services/listings.service";
import type { ListingFilters } from "@/features/housing/types/housing.types";
import type { MatchListingsArgs } from "@dakareaseu/types";

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ["listings", "list", filters],
    queryFn: () => listingsService.fetchListings(filters),
  });
}

export function useMatchedListings(args: MatchListingsArgs, enabled: boolean) {
  return useQuery({
    queryKey: ["listings", "matches", args],
    queryFn: () => listingsService.matchListings(args),
    enabled,
  });
}
