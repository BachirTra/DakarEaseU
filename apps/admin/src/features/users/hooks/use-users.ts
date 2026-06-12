'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchAdminUsers, setUserBlocked } from '../services/users.service';

export function useAdminUsers() {
  return useQuery({ queryKey: ['users'], queryFn: fetchAdminUsers });
}

export function useSetUserBlocked() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) =>
      setUserBlocked(userId, isBlocked),
    onSuccess: (_data, variables) => {
      toast.success(variables.isBlocked ? 'Compte bloqué.' : 'Compte débloqué.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
