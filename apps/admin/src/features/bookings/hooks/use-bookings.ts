'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchBookingDetail,
  fetchBookings,
  setBookingStatus,
  type BookingsFilters,
} from '../services/bookings.service';
import type { BookingStatus } from '@dakareaseu/types';

export function useBookings(filters: BookingsFilters) {
  return useQuery({ queryKey: ['bookings', filters], queryFn: () => fetchBookings(filters) });
}

export function useBookingDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['bookings', 'detail', id],
    queryFn: () => fetchBookingDetail(id!),
    enabled: !!id,
  });
}

export function useSetBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      setBookingStatus(id, status),
    onSuccess: (_data, variables) => {
      toast.success('Statut de la réservation mis à jour.');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'stats'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
