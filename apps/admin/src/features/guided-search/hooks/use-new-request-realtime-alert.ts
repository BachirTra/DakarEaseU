'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Notification } from '@dakareaseu/types';

/**
 * Subscribes to Realtime notifications for the current admin user,
 * filtered on type='new_guided_search_request'. Rows are inserted by the
 * notify_admins_new_guided_search trigger for each admin profile on every
 * new guided_search_requests row, scoped to the current user via RLS
 * policy notifications_select_self.
 */
export function useNewGuidedSearchRequestAlert(currentUserId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`admin-guided-search-alerts-${currentUserId}`)
      .on<Notification>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (payload.new.type !== 'new_guided_search_request') return;

          toast.info(payload.new.title, { description: payload.new.body ?? undefined });
          queryClient.invalidateQueries({ queryKey: ['guided-search'] });
          queryClient.invalidateQueries({ queryKey: ['overview', 'stats'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);
}
