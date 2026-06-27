'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeleteBonPlan } from '../hooks/use-bon-plans';
import type { BonPlanWithCategory } from '../services/bon-plans.service';

function DeleteButton({ id }: { id: string }) {
  const deleteMutation = useDeleteBonPlan();
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={deleteMutation.isPending}
      onClick={() => {
        if (confirm('Supprimer ce bon plan ?')) deleteMutation.mutate(id);
      }}
    >
      Supprimer
    </Button>
  );
}

export const bonPlansColumns: ColumnDef<BonPlanWithCategory>[] = [
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => (
      <Link href={`/bon-plans/${row.original.id}`} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
    cell: ({ row }) => row.original.category?.name ?? '—',
  },
  {
    accessorKey: 'price_min',
    header: 'Prix min',
    cell: ({ row }) =>
      row.original.price_min > 0
        ? `${row.original.price_min.toLocaleString('fr-FR')} FCFA`
        : 'Gratuit',
  },
  {
    accessorKey: 'is_featured',
    header: 'À la une',
    cell: ({ row }) => (
      <Badge variant={row.original.is_featured ? 'default' : 'secondary'}>
        {row.original.is_featured ? 'Oui' : 'Non'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link href={`/bon-plans/${row.original.id}`}>
          <Button variant="outline" size="sm">
            Modifier
          </Button>
        </Link>
        <DeleteButton id={row.original.id} />
      </div>
    ),
  },
];
