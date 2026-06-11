import { ReactNode, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import type { Booking, EventRsvp, Notification } from "@dakareaseu/types";

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const userId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`realtime:user:${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings", filter: `student_id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as Booking;
          queryClient.invalidateQueries({ queryKey: ["bookings", "list", userId] });
          queryClient.setQueryData(["bookings", "detail", updated.id], updated);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "event_rsvps", filter: `student_id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as EventRsvp;
          if (updated.status === "confirmed") {
            queryClient.invalidateQueries({ queryKey: ["events", "rsvps", userId] });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const created = payload.new as Notification;
          queryClient.setQueryData<Notification[]>(
            ["notifications", "list", userId],
            (prev: Notification[] | undefined) => (prev ? [created, ...prev] : [created])
          );
          queryClient.invalidateQueries({ queryKey: ["notifications", "unreadCount", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return <>{children}</>;
}
