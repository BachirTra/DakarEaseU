'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeletePack } from '../hooks/use-packs';
import type { PackWithItemCount } from '../services/packs.service';

function DeletePackButton({ id }: { id: string }) {
  const deleteMutation = useDeletePack();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={deleteMutation.isPending}
      onClick={() => {
        if (confirm('Supprimer ce pack ?')) deleteMutation.mutate(id);
      }}
    >
      Supprimer
    </Button>
  );
}

export const packsColumns: ColumnDef<PackWithItemCount>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => (
      <Link href={`/packs/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Prix',
    cell: ({ row }) => `${row.original.price.toLocaleString('fr-FR')} FCFA`,
  },
  {
    id: 'itemCount',
    header: 'Articles',
    cell: ({ row }) => row.original.itemCount,
  },
  {
    accessorKey: 'is_active',
    header: 'Actif',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
        {row.original.is_active ? 'Oui' : 'Non'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Link href={`/packs/${row.original.id}`} className="text-sm font-medium hover:underline">
          Modifier
        </Link>
        <DeletePackButton id={row.original.id} />
      </div>
    ),
  },
];
