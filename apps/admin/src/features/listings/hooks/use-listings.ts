'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchListingDistricts,
  fetchListings,
  updateListingVerificationStatus,
  deleteListing,
  type ListingsFilters,
  type ListingVerificationStatus,
} from '../services/listings.service';

export function useListings(filters: ListingsFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => fetchListings(filters),
  });
}

export function useListingDistricts() {
  return useQuery({
    queryKey: ['listings', 'districts'],
    queryFn: fetchListingDistricts,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateListingVerificationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingVerificationStatus }) =>
      updateListingVerificationStatus(id, status),
    onSuccess: () => {
      toast.success('Statut de vérification mis à jour.');
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'stats'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      toast.success('Annonce supprimée.');
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
