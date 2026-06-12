import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as eventsService from "@/features/news/services/events.service";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import type { EventCategory, RsvpStatus } from "@dakareaseu/types";

export type RsvpIntent = "interested" | "going";

export function toRsvpStatus(intent: RsvpIntent): RsvpStatus {
  return intent === "going" ? "confirmed" : "interested";
}

export function useEvents(category: EventCategory | "all") {
  return useQuery({
    queryKey: ["events", "list", category],
    queryFn: () => eventsService.fetchEvents(category),
  });
}

export function useEventDetail(eventId: string | undefined) {
  return useQuery({
    queryKey: ["events", "detail", eventId],
    queryFn: () => eventsService.fetchEventDetail(eventId as string),
    enabled: Boolean(eventId),
  });
}

export function useMyRsvp(eventId: string | undefined) {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["events", "rsvp", eventId, userId],
    queryFn: () => eventsService.fetchMyRsvp(eventId as string, userId as string),
    enabled: Boolean(eventId && userId),
  });
}

export function useSetRsvp(eventId: string) {
  const userId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (intent: RsvpIntent) => {
      if (!userId) throw new Error("Utilisateur non authentifié");
      return eventsService.upsertRsvp({ eventId, userId, status: toRsvpStatus(intent) });
    },
    onSuccess: (rsvp) => {
      queryClient.setQueryData(["events", "rsvp", eventId, userId], rsvp);
      queryClient.invalidateQueries({ queryKey: ["events", "rsvps", userId] });
    },
  });
}
