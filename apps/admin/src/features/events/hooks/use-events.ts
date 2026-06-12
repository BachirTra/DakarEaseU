'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createEvent,
  deleteEvent,
  fetchEventDetail,
  fetchEventRsvps,
  fetchEvents,
  updateEvent,
  uploadEventCoverImage,
} from '../services/events.service';
import type { EventRow } from '@dakareaseu/types';
import type { EventFormValues } from '../schemas/event.schema';

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: fetchEvents });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', 'detail', id],
    queryFn: () => fetchEventDetail(id!),
    enabled: !!id,
  });
}

export function useEventRsvps(eventId: string | undefined) {
  return useQuery({
    queryKey: ['events', 'rsvps', eventId],
    queryFn: () => fetchEventRsvps(eventId!),
    enabled: !!eventId,
  });
}

function useInvalidateEvent(id?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['events', 'detail', id] });
  };
}

export function useSaveEvent(id?: string) {
  const invalidate = useInvalidateEvent(id);
  return useMutation<EventRow | undefined, Error, EventFormValues>({
    mutationFn: async (values) => {
      if (id) {
        await updateEvent(id, values);
        return undefined;
      }
      return createEvent(values);
    },
    onSuccess: () => {
      toast.success(id ? 'Événement mis à jour.' : 'Événement créé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success('Événement supprimé.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadEventCoverImage(eventId: string) {
  const invalidate = useInvalidateEvent(eventId);
  return useMutation({
    mutationFn: (file: File) => uploadEventCoverImage(eventId, file),
    onSuccess: () => {
      toast.success('Image de couverture mise à jour.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
