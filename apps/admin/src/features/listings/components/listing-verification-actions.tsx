'use client';

import { Button } from '@/components/ui/button';
import { useUpdateListingVerificationStatus } from '../hooks/use-listings';
import type { Listing } from '@dakareaseu/types';

export function ListingVerificationActions({ listing }: { listing: Listing }) {
  const mutation = useUpdateListingVerificationStatus();

  if (listing.verification_status === 'published') {
    return (
      <Button
        variant="outline"
        onClick={() => mutation.mutate({ id: listing.id, status: 'pending' })}
        disabled={mutation.isPending}
      >
        Repasser en attente
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => mutation.mutate({ id: listing.id, status: 'published' })}
        disabled={mutation.isPending}
      >
        Publier
      </Button>
      <Button
        variant="destructive"
        onClick={() => mutation.mutate({ id: listing.id, status: 'rejected' })}
        disabled={mutation.isPending}
      >
        Rejeter
      </Button>
    </div>
  );
}
