'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createPack,
  deletePack,
  fetchPackById,
  fetchPackOrders,
  fetchPacks,
  fetchPackStats,
  fetchWhatsAppSetting,
  savePackItems,
  updateOrderStatus,
  updatePack,
  upsertWhatsAppSetting,
  type Pack,
  type PackItemInput,
} from '../services/packs.service';
import type { PackFormValues } from '../schemas/pack.schema';

export function usePacks() {
  return useQuery({ queryKey: ['packs'], queryFn: fetchPacks });
}

export function usePackDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['packs', 'detail', id],
    queryFn: () => fetchPackById(id!),
    enabled: !!id,
  });
}

function useInvalidatePack(id?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['packs'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['packs', 'detail', id] });
  };
}

export function useSavePack(id?: string) {
  const invalidate = useInvalidatePack(id);
  return useMutation<Pack | undefined, Error, PackFormValues>({
    mutationFn: async (values) => {
      if (id) {
        await updatePack(id, values);
        return undefined;
      }
      return createPack(values);
    },
    onSuccess: () => {
      toast.success(id ? 'Pack mis à jour.' : 'Pack créé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeletePack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePack,
    onSuccess: () => {
      toast.success('Pack supprimé.');
      queryClient.invalidateQueries({ queryKey: ['packs'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSavePackItems(packId: string) {
  const invalidate = useInvalidatePack(packId);
  return useMutation({
    mutationFn: (items: PackItemInput[]) => savePackItems(packId, items),
    onSuccess: () => {
      toast.success('Articles enregistrés.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function usePackOrders() {
  return useQuery({ queryKey: ['pack-orders'], queryFn: fetchPackOrders });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Statut mis à jour.');
      queryClient.invalidateQueries({ queryKey: ['pack-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pack-stats'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function usePackStats() {
  return useQuery({ queryKey: ['pack-stats'], queryFn: fetchPackStats, staleTime: 60_000 });
}

export function useWhatsAppSetting() {
  return useQuery({ queryKey: ['whatsapp-setting'], queryFn: fetchWhatsAppSetting });
}

export function useUpsertWhatsAppSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertWhatsAppSetting,
    onSuccess: () => {
      toast.success('Numéro WhatsApp enregistré.');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-setting'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
