'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { useBonPlans } from '@/features/bon-plans/hooks/use-bon-plans';
import { bonPlansColumns } from '@/features/bon-plans/components/bon-plans-columns';

export default function BonPlansPage() {
  const { data = [], isLoading } = useBonPlans();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bons Plans</h1>
          <p className="text-muted-foreground">Activités et loisirs à Dakar.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/bon-plans/categories" className={buttonVariants({ variant: 'outline' })}>
            Catégories
          </Link>
          <Link href="/bon-plans/new" className={buttonVariants()}>
            Nouveau bon plan
          </Link>
        </div>
      </div>
      <DataTable
        columns={bonPlansColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun bon plan enregistré."
      />
    </div>
  );
}
