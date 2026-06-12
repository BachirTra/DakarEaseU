'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventRsvps } from '../hooks/use-events';

const STATUS_LABELS: Record<string, string> = {
  interested: 'Intéressé·e',
  confirmed: 'Confirmé·e',
};

export function EventRsvpsList({ eventId }: { eventId: string }) {
  const { data: rsvps = [], isLoading } = useEventRsvps(eventId);

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (rsvps.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        Aucune participation enregistrée pour le moment.
      </p>
    );

  return (
    <ul className="space-y-2">
      {rsvps.map((rsvp) => (
        <li
          key={rsvp.id}
          className="flex items-center justify-between rounded-md border p-3 text-sm"
        >
          <div>
            <p className="font-medium">
              {rsvp.attendee?.full_name ?? 'Étudiant·e sans nom renseigné'}
            </p>
            <p className="text-muted-foreground">{rsvp.attendee?.phone ?? '—'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={rsvp.status === 'confirmed' ? 'default' : 'secondary'}>
              {STATUS_LABELS[rsvp.status] ?? rsvp.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {rsvp.checked_in_at
                ? `Check-in : ${new Date(rsvp.checked_in_at).toLocaleString('fr-FR')}`
                : 'Pas encore check-in'}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
