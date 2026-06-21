'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateOrderStatus } from '../hooks/use-packs';
import type { PackOrder } from '../services/packs.service';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

function StatusSelect({ order }: { order: PackOrder }) {
  const updateMutation = useUpdateOrderStatus();
  return (
    <Select
      value={order.status}
      onValueChange={(status) => {
        if (status) updateMutation.mutate({ id: order.id, status });
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const packOrdersColumns: ColumnDef<PackOrder>[] = [
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('fr-FR'),
  },
  {
    id: 'pack',
    header: 'Pack commandé',
    cell: ({ row }) => row.original.pack?.name ?? 'Pack supprimé',
  },
  {
    id: 'student',
    header: 'Étudiant',
    cell: ({ row }) => row.original.profile?.full_name ?? '—',
  },
  {
    id: 'whatsapp',
    header: 'WhatsApp',
    cell: ({ row }) => row.original.whatsapp_snapshot || row.original.profile?.phone || '—',
  },
  {
    id: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusSelect order={row.original} />,
  },
];
