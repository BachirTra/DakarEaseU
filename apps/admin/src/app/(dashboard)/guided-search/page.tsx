'use client';

import { useState } from 'react';
import { GUIDED_SEARCH_STATUS_LABELS } from '@dakareaseu/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/shared/components/data-table';
import { useGuidedSearchRequests } from '@/features/guided-search/hooks/use-guided-search-requests';
import { guidedSearchColumns } from '@/features/guided-search/components/guided-search-columns';
import type { GuidedSearchFilters } from '@/features/guided-search/services/guided-search.service';

export default function GuidedSearchPage() {
  const [filters, setFilters] = useState<GuidedSearchFilters>({ status: 'all' });
  const { data = [], isLoading } = useGuidedSearchRequests(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demandes de recherche guidée</h1>
        <p className="text-muted-foreground">
          Critères soumis par les étudiants via la recherche guidée.
        </p>
      </div>
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(value) => setFilters({ status: value as GuidedSearchFilters['status'] })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {Object.entries(GUIDED_SEARCH_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DataTable
        columns={guidedSearchColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucune demande ne correspond à ce filtre."
      />
    </div>
  );
}
