import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationsService from '@/features/profile/services/notifications.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';

export function useNotifications() {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['notifications', 'list', userId],
    queryFn: () => notificationsService.fetchNotifications(userId as string),
    enabled: Boolean(userId),
  });
}

export function useUnreadNotificationsCount() {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['notifications', 'unreadCount', userId],
    queryFn: () => notificationsService.fetchUnreadCount(userId as string),
    enabled: Boolean(userId),
  });
}

export function useMarkAllNotificationsRead() {
  const userId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(userId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount', userId] });
    },
  });
}
