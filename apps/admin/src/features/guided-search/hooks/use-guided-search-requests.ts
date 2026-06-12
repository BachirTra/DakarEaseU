'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchGuidedSearchRequestDetail,
  fetchGuidedSearchRequests,
  fetchMatchesForRequest,
  setGuidedSearchStatus,
  type GuidedSearchFilters,
} from '../services/guided-search.service';
import type { GuidedSearchRequest, GuidedSearchStatus } from '@dakareaseu/types';

export function useGuidedSearchRequests(filters: GuidedSearchFilters) {
  return useQuery({
    queryKey: ['guided-search', filters],
    queryFn: () => fetchGuidedSearchRequests(filters),
  });
}

export function useGuidedSearchRequestDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['guided-search', 'detail', id],
    queryFn: () => fetchGuidedSearchRequestDetail(id!),
    enabled: !!id,
  });
}

export function useMatchesForRequest(request: GuidedSearchRequest | undefined) {
  return useQuery({
    queryKey: ['guided-search', 'matches', request?.id],
    queryFn: () => fetchMatchesForRequest(request!),
    enabled: !!request,
  });
}

export function useSetGuidedSearchStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: GuidedSearchStatus }) =>
      setGuidedSearchStatus(id, status),
    onSuccess: (_data, variables) => {
      toast.success('Statut de la demande mis à jour.');
      queryClient.invalidateQueries({ queryKey: ['guided-search'] });
      queryClient.invalidateQueries({ queryKey: ['guided-search', 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'stats'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
