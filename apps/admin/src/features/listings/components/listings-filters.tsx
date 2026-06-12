'use client';

import { LISTING_TYPE_LABELS, LISTING_VERIFICATION_STATUS_LABELS } from '@dakareaseu/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useListingDistricts } from '../hooks/use-listings';
import type { ListingsFilters } from '../services/listings.service';

export function ListingsFiltersBar({
  filters,
  onChange,
}: {
  filters: ListingsFilters;
  onChange: (filters: ListingsFilters) => void;
}) {
  const { data: districts = [] } = useListingDistricts();

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={filters.verificationStatus ?? 'all'}
        onValueChange={(value) =>
          onChange({
            ...filters,
            verificationStatus: value as ListingsFilters['verificationStatus'],
          })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Statut de vérification" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {Object.entries(LISTING_VERIFICATION_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.district ?? 'all'}
        onValueChange={(value) => onChange({ ...filters, district: value ?? undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Quartier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les quartiers</SelectItem>
          {districts.map((district) => (
            <SelectItem key={district} value={district}>
              {district}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type ?? 'all'}
        onValueChange={(value) => onChange({ ...filters, type: value as ListingsFilters['type'] })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Type de logement" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          {Object.entries(LISTING_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
