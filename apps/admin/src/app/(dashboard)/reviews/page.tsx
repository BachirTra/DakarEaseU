'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/shared/components/data-table';
import { useReviews } from '@/features/reviews/hooks/use-reviews';
import { reviewsColumns } from '@/features/reviews/components/reviews-columns';
import type { ReviewsFilters } from '@/features/reviews/services/reviews.service';

const TARGET_TYPE_OPTIONS: { value: NonNullable<ReviewsFilters['targetType']>; label: string }[] = [
  { value: 'all', label: 'Toutes les cibles' },
  { value: 'listing', label: 'Logements' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'stay', label: 'Séjours' },
];

export default function ReviewsPage() {
  const [filters, setFilters] = useState<ReviewsFilters>({ targetType: 'all' });
  const { data = [], isLoading } = useReviews(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Modération des avis</h1>
        <p className="text-muted-foreground">
          Visualisez et supprimez les avis problématiques (logements, restaurants, séjours).
        </p>
      </div>
      <Select
        value={filters.targetType ?? 'all'}
        onValueChange={(value) => setFilters({ targetType: value as ReviewsFilters['targetType'] })}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TARGET_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DataTable
        columns={reviewsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun avis enregistré."
      />
    </div>
  );
}
