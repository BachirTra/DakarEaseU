'use client';

import { Button } from '@/components/ui/button';
import { useSetBookingStatus } from '../hooks/use-bookings';
import type { Booking } from '@dakareaseu/types';

const TRANSITIONS: Record<
  Booking['status'],
  { label: string; next: Booking['status']; variant?: 'default' | 'destructive' | 'outline' }[]
> = {
  pending: [
    { label: 'Confirmer', next: 'confirmed' },
    { label: 'Annuler', next: 'cancelled', variant: 'destructive' },
  ],
  confirmed: [
    { label: 'Marquer comme terminée', next: 'completed' },
    { label: 'Annuler', next: 'cancelled', variant: 'destructive' },
  ],
  cancelled: [],
  completed: [],
};

export function BookingStatusActions({ booking }: { booking: Booking }) {
  const mutation = useSetBookingStatus();
  const transitions = TRANSITIONS[booking.status];

  if (transitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucune transition possible depuis ce statut.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {transitions.map((transition) => (
        <Button
          key={transition.next}
          variant={transition.variant ?? 'default'}
          onClick={() => mutation.mutate({ id: booking.id, status: transition.next })}
          disabled={mutation.isPending}
        >
          {transition.label}
        </Button>
      ))}
    </div>
  );
}
