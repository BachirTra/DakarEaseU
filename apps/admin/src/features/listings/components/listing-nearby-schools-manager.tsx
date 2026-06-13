'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useSchoolsForSelection, useSetNearbySchools } from '../hooks/use-listing-detail';

export function ListingNearbySchoolsManager({
  listingId,
  initialSchoolIds,
}: {
  listingId: string;
  initialSchoolIds: string[];
}) {
  const { data: schools = [], isLoading } = useSchoolsForSelection();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSchoolIds));
  const mutation = useSetNearbySchools(listingId);

  function toggle(schoolId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(schoolId)) next.delete(schoolId);
      else next.add(schoolId);
      return next;
    });
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Sélectionne les écoles pour lesquelles cette annonce doit apparaître dans &quot;Logements à
        proximité&quot; et bénéficier du bonus de proximité dans l&apos;algorithme de matching (
        <code>match_listings</code>).
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {schools.map((school) => (
          <li key={school.id} className="flex items-center gap-2 rounded-md border p-2">
            <Checkbox
              checked={selected.has(school.id)}
              onCheckedChange={() => toggle(school.id)}
              id={`school-${school.id}`}
            />
            <label htmlFor={`school-${school.id}`} className="cursor-pointer text-sm">
              {school.name} <span className="text-muted-foreground">({school.district})</span>
            </label>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        onClick={() => mutation.mutate(Array.from(selected))}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Enregistrement…' : 'Enregistrer les écoles à proximité'}
      </Button>
    </div>
  );
}
