'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { useTransportProviders } from '@/features/transport/hooks/use-transport-providers';
import { buildTransportProvidersColumns } from '@/features/transport/components/transport-providers-columns';
import { TransportProviderDialog } from '@/features/transport/components/transport-provider-dialog';
import type { TransportProvider } from '@dakareaseu/types';

export default function TransportPage() {
  const { data = [], isLoading } = useTransportProviders();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<TransportProvider | undefined>(undefined);

  function openCreateDialog() {
    setEditingProvider(undefined);
    setDialogOpen(true);
  }

  function openEditDialog(provider: TransportProvider) {
    setEditingProvider(provider);
    setDialogOpen(true);
  }

  const columns = buildTransportProvidersColumns(openEditDialog);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transport / Livraison</h1>
          <p className="text-muted-foreground">Annuaire des prestataires par catégorie.</p>
        </div>
        <Button onClick={openCreateDialog}>Nouveau prestataire</Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun prestataire enregistré."
      />
      <TransportProviderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        provider={editingProvider}
      />
    </div>
  );
}
