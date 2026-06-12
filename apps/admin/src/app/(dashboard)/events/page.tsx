'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { useEvents } from '@/features/events/hooks/use-events';
import { eventsColumns } from '@/features/events/components/events-columns';

export default function EventsPage() {
  const { data = [], isLoading } = useEvents();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Événements</h1>
          <p className="text-muted-foreground">Actualités culturelles et événementielles.</p>
        </div>
        <Link href="/events/new" className={buttonVariants()}>
          Nouvel événement
        </Link>
      </div>
      <DataTable
        columns={eventsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun événement enregistré."
      />
    </div>
  );
}
