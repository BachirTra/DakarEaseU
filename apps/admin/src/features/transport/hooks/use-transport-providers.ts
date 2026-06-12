'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createTransportProvider,
  deleteTransportProvider,
  fetchTransportProviders,
  updateTransportProvider,
} from '../services/transport-providers.service';
import type { TransportProviderFormValues } from '../schemas/transport-provider.schema';

export function useTransportProviders() {
  return useQuery({ queryKey: ['transport-providers'], queryFn: fetchTransportProviders });
}

export function useSaveTransportProvider(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: TransportProviderFormValues) =>
      id ? updateTransportProvider(id, values) : createTransportProvider(values),
    onSuccess: () => {
      toast.success(id ? 'Prestataire mis à jour.' : 'Prestataire ajouté.');
      queryClient.invalidateQueries({ queryKey: ['transport-providers'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteTransportProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransportProvider,
    onSuccess: () => {
      toast.success('Prestataire supprimé.');
      queryClient.invalidateQueries({ queryKey: ['transport-providers'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
