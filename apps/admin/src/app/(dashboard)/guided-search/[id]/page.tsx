'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGuidedSearchRequestDetail,
  useMatchesForRequest,
} from '@/features/guided-search/hooks/use-guided-search-requests';
import { GuidedSearchStatusActions } from '@/features/guided-search/components/guided-search-status-actions';

export default function GuidedSearchDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: request, isLoading } = useGuidedSearchRequestDetail(params.id);
  const { data: matches = [], isLoading: matchesLoading } = useMatchesForRequest(request);

  if (isLoading || !request) return <Skeleton className="h-72 w-full" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {request.student?.full_name ?? 'Étudiant·e sans nom renseigné'}
        </h1>
        <p className="text-muted-foreground">
          {request.student?.phone ?? 'Téléphone non renseigné'}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Critères</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Type recherché</p>
            <p className="font-medium">{request.housing_type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">École</p>
            <p className="font-medium">{request.school?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Quartier</p>
            <p className="font-medium">{request.district ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Budget</p>
            <p className="font-medium">{request.budget.toLocaleString('fr-FR')} XOF</p>
          </div>
          <div>
            <p className="text-muted-foreground">Préférence meublé</p>
            <p className="font-medium">{request.furnished_pref}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Préférence colocation</p>
            <p className="font-medium">{request.coloc_pref}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Durée souhaitée</p>
            <p className="font-medium">{request.duration_months} mois</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Meilleurs logements correspondants (RPC match_listings)</CardTitle>
        </CardHeader>
        <CardContent>
          {matchesLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune correspondance calculée.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {matches.map((match) => (
                <li
                  key={match.listing_id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {match.listing_id}
                  </span>
                  <span className="font-semibold">
                    {match.match_pct}% — {(match.reasons ?? []).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Changer le statut</CardTitle>
        </CardHeader>
        <CardContent>
          <GuidedSearchStatusActions request={request} />
        </CardContent>
      </Card>
    </div>
  );
}
