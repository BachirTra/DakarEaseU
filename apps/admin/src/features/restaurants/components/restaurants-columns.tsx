'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { Restaurant } from '@dakareaseu/types';
import { Badge } from '@/components/ui/badge';

export const restaurantsColumns: ColumnDef<Restaurant>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => (
      <Link href={`/restaurants/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: 'cuisine_type', header: 'Cuisine' },
  { accessorKey: 'district', header: 'Quartier' },
  {
    accessorKey: 'rating',
    header: 'Note',
    cell: ({ row }) => (row.original.rating ? `★ ${row.original.rating}` : '—'),
  },
  {
    accessorKey: 'has_delivery',
    header: 'Livraison',
    cell: ({ row }) => (
      <Badge variant={row.original.has_delivery ? 'default' : 'secondary'}>
        {row.original.has_delivery ? 'Oui' : 'Non'}
      </Badge>
    ),
  },
];
