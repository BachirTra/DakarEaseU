'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchPendingVerifications,
  fetchSignedDocumentUrl,
  setProfileBlocked,
  setVerificationStatus,
  type VerificationStatus,
} from '../services/verifications.service';

export function usePendingVerifications() {
  return useQuery({ queryKey: ['verifications', 'pending'], queryFn: fetchPendingVerifications });
}

export function useSignedDocumentUrl(path: string | null) {
  return useQuery({
    queryKey: ['verifications', 'signed-url', path],
    queryFn: () => fetchSignedDocumentUrl(path!),
    enabled: !!path,
    staleTime: 60_000,
    retry: false,
  });
}

export function useSetVerificationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, status }: { profileId: string; status: VerificationStatus }) =>
      setVerificationStatus(profileId, status),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.status === 'approved' ? 'Carte étudiante approuvée.' : 'Carte étudiante rejetée.',
      );
      queryClient.invalidateQueries({ queryKey: ['verifications', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'stats'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSetProfileBlocked() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, isBlocked }: { profileId: string; isBlocked: boolean }) =>
      setProfileBlocked(profileId, isBlocked),
    onSuccess: (_data, variables) => {
      toast.success(variables.isBlocked ? 'Compte bloqué.' : 'Compte débloqué.');
      queryClient.invalidateQueries({ queryKey: ['verifications', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
