'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { usePacks } from '@/features/packs/hooks/use-packs';
import { packsColumns } from '@/features/packs/components/packs-columns';
import { PackKpiCards } from '@/features/packs/components/pack-kpi-cards';
import { PackOrdersTable } from '@/features/packs/components/pack-orders-table';
import { WhatsappSettingsForm } from '@/features/packs/components/whatsapp-settings-form';

export default function PacksPage() {
  const { data = [], isLoading } = usePacks();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Packs Étudiants</h1>
        <p className="text-muted-foreground">
          Packs alimentaires pour étudiants et suivi des commandes.
        </p>
      </div>

      <PackKpiCards />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Packs</h2>
          <Link href="/packs/new" className={buttonVariants()}>
            Nouveau pack
          </Link>
        </div>
        <DataTable
          columns={packsColumns}
          data={data}
          isLoading={isLoading}
          emptyMessage="Aucun pack enregistré."
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Commandes</h2>
        <PackOrdersTable />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Paramètres</h2>
        <WhatsappSettingsForm />
      </section>
    </div>
  );
}
