'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  addBonPlanVideoUrl,
  createBonPlan,
  deleteBonPlan,
  deleteBonPlanMedia,
  fetchBonPlanDetail,
  fetchBonPlanMedia,
  fetchBonPlans,
  updateBonPlan,
  uploadBonPlanCoverImage,
  uploadBonPlanMediaFile,
} from '../services/bon-plans.service';
import type { BonPlanRow } from '@dakareaseu/types';
import type { BonPlanFormValues } from '../schemas/bon-plan.schema';

export function useBonPlans() {
  return useQuery({ queryKey: ['bon-plans'], queryFn: fetchBonPlans });
}

export function useBonPlan(id: string | undefined) {
  return useQuery({
    queryKey: ['bon-plans', 'detail', id],
    queryFn: () => fetchBonPlanDetail(id!),
    enabled: !!id,
  });
}

export function useBonPlanMedia(bonPlanId: string | undefined) {
  return useQuery({
    queryKey: ['bon-plans', 'media', bonPlanId],
    queryFn: () => fetchBonPlanMedia(bonPlanId!),
    enabled: !!bonPlanId,
  });
}

function useInvalidateBonPlan(id?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['bon-plans'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['bon-plans', 'detail', id] });
  };
}

export function useSaveBonPlan(id?: string) {
  const invalidate = useInvalidateBonPlan(id);
  return useMutation<BonPlanRow | undefined, Error, BonPlanFormValues>({
    mutationFn: async (values) => {
      if (id) {
        await updateBonPlan(id, values);
        return undefined;
      }
      return createBonPlan(values);
    },
    onSuccess: () => {
      toast.success(id ? 'Bon plan mis à jour.' : 'Bon plan créé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteBonPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBonPlan,
    onSuccess: () => {
      toast.success('Bon plan supprimé.');
      queryClient.invalidateQueries({ queryKey: ['bon-plans'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadBonPlanCoverImage(bonPlanId: string) {
  const invalidate = useInvalidateBonPlan(bonPlanId);
  return useMutation({
    mutationFn: (file: File) => uploadBonPlanCoverImage(bonPlanId, file),
    onSuccess: () => {
      toast.success('Image de couverture mise à jour.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddBonPlanVideoUrl(bonPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => addBonPlanVideoUrl(bonPlanId, url),
    onSuccess: () => {
      toast.success('Vidéo ajoutée.');
      queryClient.invalidateQueries({ queryKey: ['bon-plans', 'media', bonPlanId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadBonPlanMediaFile(bonPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: 'image' | 'video_upload' }) =>
      uploadBonPlanMediaFile(bonPlanId, file, type),
    onSuccess: () => {
      toast.success('Média ajouté.');
      queryClient.invalidateQueries({ queryKey: ['bon-plans', 'media', bonPlanId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteBonPlanMedia(bonPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBonPlanMedia,
    onSuccess: () => {
      toast.success('Média supprimé.');
      queryClient.invalidateQueries({ queryKey: ['bon-plans', 'media', bonPlanId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
