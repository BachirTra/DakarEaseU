'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { useRestaurants } from '@/features/restaurants/hooks/use-restaurants';
import { restaurantsColumns } from '@/features/restaurants/components/restaurants-columns';

export default function RestaurantsPage() {
  const { data = [], isLoading } = useRestaurants();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">Annuaire des restaurants étudiants.</p>
        </div>
        <Link href="/restaurants/new" className={buttonVariants()}>
          Nouveau restaurant
        </Link>
      </div>
      <DataTable
        columns={restaurantsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun restaurant enregistré."
      />
    </div>
  );
}
