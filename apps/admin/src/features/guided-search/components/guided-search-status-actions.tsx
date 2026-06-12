'use client';

import { Button } from '@/components/ui/button';
import { useSetGuidedSearchStatus } from '../hooks/use-guided-search-requests';
import type { GuidedSearchRequest } from '@dakareaseu/types';

export function GuidedSearchStatusActions({ request }: { request: GuidedSearchRequest }) {
  const mutation = useSetGuidedSearchStatus();

  if (request.status === 'closed') {
    return <p className="text-sm text-muted-foreground">Cette demande est fermée.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {request.status === 'open' && (
        <Button
          onClick={() => mutation.mutate({ id: request.id, status: 'matched' })}
          disabled={mutation.isPending}
        >
          Marquer comme matchée
        </Button>
      )}
      <Button
        variant="outline"
        onClick={() => mutation.mutate({ id: request.id, status: 'closed' })}
        disabled={mutation.isPending}
      >
        Fermer la demande
      </Button>
    </div>
  );
}
