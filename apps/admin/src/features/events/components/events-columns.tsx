'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { EventRow } from '@dakareaseu/types';
import { EVENT_CATEGORY_LABELS } from '../schemas/event.schema';
import { Badge } from '@/components/ui/badge';

export const eventsColumns: ColumnDef<EventRow>[] = [
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => (
      <Link href={`/events/${row.original.id}`} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
    cell: ({ row }) => EVENT_CATEGORY_LABELS[row.original.category] ?? row.original.category,
  },
  { accessorKey: 'event_date', header: 'Date' },
  { accessorKey: 'venue', header: 'Lieu' },
  {
    accessorKey: 'is_featured',
    header: 'À la une',
    cell: ({ row }) => (
      <Badge variant={row.original.is_featured ? 'default' : 'secondary'}>
        {row.original.is_featured ? 'Oui' : 'Non'}
      </Badge>
    ),
  },
];
