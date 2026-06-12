'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { useListings } from '../hooks/use-listings';
import { listingsColumns } from './listings-columns';
import { ListingsFiltersBar } from './listings-filters';
import type { ListingsFilters } from '../services/listings.service';

export function ListingsTable() {
  const [filters, setFilters] = useState<ListingsFilters>({
    verificationStatus: 'all',
    district: 'all',
    type: 'all',
  });
  const { data = [], isLoading } = useListings(filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ListingsFiltersBar filters={filters} onChange={setFilters} />
        <Link href="/dashboard/listings/new" className={buttonVariants()}>
          Nouvelle annonce
        </Link>
      </div>
      <DataTable
        columns={listingsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucune annonce ne correspond à ces filtres."
      />
    </div>
  );
}
