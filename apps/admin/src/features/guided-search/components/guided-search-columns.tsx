'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { GUIDED_SEARCH_STATUS_LABELS } from '@dakareaseu/shared';
import { Badge } from '@/components/ui/badge';
import type { GuidedSearchRequestWithRelations } from '../services/guided-search.service';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  open: 'default',
  matched: 'secondary',
  closed: 'outline',
};

export const guidedSearchColumns: ColumnDef<GuidedSearchRequestWithRelations>[] = [
  {
    id: 'student',
    header: 'Étudiant·e',
    cell: ({ row }) => (
      <Link href={`/guided-search/${row.original.id}`} className="font-medium hover:underline">
        {row.original.student?.full_name ?? 'Étudiant·e sans nom renseigné'}
      </Link>
    ),
  },
  {
    accessorKey: 'housing_type',
    header: 'Type recherché',
  },
  {
    id: 'school',
    header: 'École',
    cell: ({ row }) => row.original.school?.name ?? '—',
  },
  {
    accessorKey: 'district',
    header: 'Quartier',
    cell: ({ row }) => row.original.district ?? '—',
  },
  {
    accessorKey: 'budget',
    header: 'Budget',
    cell: ({ row }) => `${row.original.budget.toLocaleString('fr-FR')} XOF`,
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status] ?? 'secondary'}>
        {GUIDED_SEARCH_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
];
