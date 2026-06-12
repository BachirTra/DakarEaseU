'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventForm } from '@/features/events/components/event-form';

export default function NewEventPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouvel événement</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm onSaved={(id) => router.push(`/events/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
