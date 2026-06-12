'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { useSchools } from '@/features/schools/hooks/use-schools';
import { schoolsColumns } from '@/features/schools/components/schools-columns';

export default function SchoolsPage() {
  const { data = [], isLoading } = useSchools();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Écoles</h1>
          <p className="text-muted-foreground">Annuaire des écoles partenaires.</p>
        </div>
        <Link href="/schools/new" className={buttonVariants()}>
          Nouvelle école
        </Link>
      </div>
      <DataTable
        columns={schoolsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucune école enregistrée."
      />
    </div>
  );
}
