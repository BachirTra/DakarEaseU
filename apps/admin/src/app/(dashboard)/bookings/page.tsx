'use client';

import { useState } from 'react';
import { DataTable } from '@/shared/components/data-table';
import { useBookings } from '@/features/bookings/hooks/use-bookings';
import { bookingsColumns } from '@/features/bookings/components/bookings-columns';
import { BookingsFiltersBar } from '@/features/bookings/components/bookings-filters';
import type { BookingsFilters } from '@/features/bookings/services/bookings.service';

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingsFilters>({ status: 'all', paymentStatus: 'all' });
  const { data = [], isLoading } = useBookings(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Réservations</h1>
        <p className="text-muted-foreground">
          Suivi des réservations de logement et de leur statut de paiement simulé.
        </p>
      </div>
      <BookingsFiltersBar filters={filters} onChange={setFilters} />
      <DataTable
        columns={bookingsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucune réservation ne correspond à ces filtres."
      />
    </div>
  );
}
