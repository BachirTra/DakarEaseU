'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvent } from '@/features/events/hooks/use-events';
import { EventForm } from '@/features/events/components/event-form';
import { EventRsvpsList } from '@/features/events/components/event-rsvps-list';

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(params.id);

  if (isLoading || !event) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm event={event} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Participants (RSVP)</CardTitle>
        </CardHeader>
        <CardContent>
          <EventRsvpsList eventId={event.id} />
        </CardContent>
      </Card>
    </div>
  );
}
