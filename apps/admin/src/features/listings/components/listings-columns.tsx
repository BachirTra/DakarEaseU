'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { Listing } from '@dakareaseu/types';
import { LISTING_TYPE_LABELS, LISTING_VERIFICATION_STATUS_LABELS } from '@dakareaseu/shared';
import { Badge } from '@/components/ui/badge';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  published: 'default',
  rejected: 'destructive',
};

export const listingsColumns: ColumnDef<Listing>[] = [
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => (
      <Link href={`/dashboard/listings/${row.original.id}`} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => LISTING_TYPE_LABELS[row.original.type] ?? row.original.type,
  },
  {
    accessorKey: 'district',
    header: 'Quartier',
  },
  {
    accessorKey: 'price',
    header: 'Prix',
    cell: ({ row }) => `${row.original.price.toLocaleString('fr-FR')} ${row.original.currency}`,
  },
  {
    accessorKey: 'verification_status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.original.verification_status;
      return (
        <Badge variant={STATUS_VARIANT[status] ?? 'secondary'}>
          {LISTING_VERIFICATION_STATUS_LABELS[status] ?? status}
        </Badge>
      );
    },
  },
];
