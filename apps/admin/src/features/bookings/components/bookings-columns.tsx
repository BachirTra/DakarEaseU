'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@dakareaseu/shared';
import { Badge } from '@/components/ui/badge';
import type { BookingWithRelations } from '../services/bookings.service';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'default',
};

const PAYMENT_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  success: 'default',
  failed: 'destructive',
};

export const bookingsColumns: ColumnDef<BookingWithRelations>[] = [
  {
    id: 'listing',
    header: 'Logement',
    cell: ({ row }) => (
      <Link href={`/bookings/${row.original.id}`} className="font-medium hover:underline">
        {row.original.listing?.title ?? 'Logement supprimé'}
      </Link>
    ),
  },
  {
    id: 'renter',
    header: 'Locataire',
    cell: ({ row }) => row.original.renter?.full_name ?? '—',
  },
  {
    accessorKey: 'duration_months',
    header: 'Durée',
    cell: ({ row }) => `${row.original.duration_months} mois`,
  },
  {
    accessorKey: 'total_amount',
    header: 'Montant',
    cell: ({ row }) => `${row.original.total_amount.toLocaleString('fr-FR')} XOF`,
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status] ?? 'secondary'}>
        {BOOKING_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'payment_status',
    header: 'Paiement',
    cell: ({ row }) => (
      <Badge variant={PAYMENT_VARIANT[row.original.payment_status] ?? 'secondary'}>
        {PAYMENT_STATUS_LABELS[row.original.payment_status] ?? row.original.payment_status}
      </Badge>
    ),
  },
];
