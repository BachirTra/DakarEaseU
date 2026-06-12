'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TransportProvider } from '@dakareaseu/types';
import { TRANSPORT_CATEGORY_LABELS } from '../schemas/transport-provider.schema';
import { Button } from '@/components/ui/button';
import { useDeleteTransportProvider } from '../hooks/use-transport-providers';

export function buildTransportProvidersColumns(
  onEdit: (provider: TransportProvider) => void,
): ColumnDef<TransportProvider>[] {
  return [
    { accessorKey: 'name', header: 'Nom' },
    {
      accessorKey: 'category',
      header: 'Catégorie',
      cell: ({ row }) =>
        TRANSPORT_CATEGORY_LABELS[row.original.category] ?? row.original.category,
    },
    {
      accessorKey: 'rating',
      header: 'Note',
      cell: ({ row }) => (row.original.rating ? `★ ${row.original.rating}` : '—'),
    },
    { accessorKey: 'eta_label', header: 'Délai' },
    { accessorKey: 'price_label', header: 'Tarif indicatif' },
    { accessorKey: 'phone', header: 'Téléphone' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <RowActions provider={row.original} onEdit={onEdit} />,
    },
  ];
}

function RowActions({
  provider,
  onEdit,
}: {
  provider: TransportProvider;
  onEdit: (provider: TransportProvider) => void;
}) {
  const deleteMutation = useDeleteTransportProvider();
  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => onEdit(provider)}>
        Modifier
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => deleteMutation.mutate(provider.id)}
      >
        Supprimer
      </Button>
    </div>
  );
}
