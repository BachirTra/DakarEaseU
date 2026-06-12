'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { School } from '@dakareaseu/types';

export const schoolsColumns: ColumnDef<School>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => (
      <Link href={`/schools/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: 'full_name', header: 'Nom complet' },
  { accessorKey: 'district', header: 'Quartier' },
  {
    accessorKey: 'students_count',
    header: 'Effectif',
    cell: ({ row }) => row.original.students_count?.toLocaleString('fr-FR') ?? '—',
  },
  { accessorKey: 'founded_year', header: 'Fondation' },
];
