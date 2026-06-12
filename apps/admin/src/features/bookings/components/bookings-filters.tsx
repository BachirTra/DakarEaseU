'use client';

import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@dakareaseu/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BookingsFilters } from '../services/bookings.service';

export function BookingsFiltersBar({
  filters,
  onChange,
}: {
  filters: BookingsFilters;
  onChange: (filters: BookingsFilters) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(value) =>
          onChange({ ...filters, status: value as BookingsFilters['status'] })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.paymentStatus ?? 'all'}
        onValueChange={(value) =>
          onChange({ ...filters, paymentStatus: value as BookingsFilters['paymentStatus'] })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Statut de paiement" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les paiements</SelectItem>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
