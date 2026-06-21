'use client';

import { DataTable } from '@/shared/components/data-table';
import { usePackOrders } from '../hooks/use-packs';
import { packOrdersColumns } from './pack-orders-columns';

export function PackOrdersTable() {
  const { data = [], isLoading } = usePackOrders();
  return (
    <DataTable
      columns={packOrdersColumns}
      data={data}
      isLoading={isLoading}
      emptyMessage="Aucune commande."
    />
  );
}
