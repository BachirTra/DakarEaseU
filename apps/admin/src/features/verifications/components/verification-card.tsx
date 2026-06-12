'use client';

import type { Profile } from '@dakareaseu/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerificationDocumentViewer } from './verification-document-viewer';
import { useSetProfileBlocked, useSetVerificationStatus } from '../hooks/use-verifications';

export function VerificationCard({ profile }: { profile: Profile }) {
  const statusMutation = useSetVerificationStatus();
  const blockMutation = useSetProfileBlocked();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{profile.full_name ?? 'Étudiant·e sans nom renseigné'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {profile.phone ?? 'Téléphone non renseigné'}
          </p>
        </div>
        <Badge variant={profile.is_blocked ? 'destructive' : 'secondary'}>
          {profile.is_blocked ? 'Compte bloqué' : 'Compte actif'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <VerificationDocumentViewer documentPath={profile.verification_doc_url} />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => statusMutation.mutate({ profileId: profile.id, status: 'approved' })}
            disabled={statusMutation.isPending}
          >
            Approuver
          </Button>
          <Button
            variant="destructive"
            onClick={() => statusMutation.mutate({ profileId: profile.id, status: 'rejected' })}
            disabled={statusMutation.isPending}
          >
            Rejeter
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              blockMutation.mutate({ profileId: profile.id, isBlocked: !profile.is_blocked })
            }
            disabled={blockMutation.isPending}
          >
            {profile.is_blocked ? 'Débloquer le compte' : 'Bloquer le compte'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
