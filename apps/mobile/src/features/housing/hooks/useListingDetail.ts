import { useQuery } from '@tanstack/react-query';
import * as listingsService from '@/features/housing/services/listings.service';

export function useListingDetail(listingId: string | undefined) {
  return useQuery({
    queryKey: ['listings', 'detail', listingId],
    queryFn: () => listingsService.fetchListingDetail(listingId as string),
    enabled: Boolean(listingId),
  });
}
