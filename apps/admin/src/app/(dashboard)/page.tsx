'use client';

import { useOverviewStats } from '@/features/overview/hooks/use-overview-stats';
import { KpiCard } from '@/features/overview/components/kpi-card';

export default function OverviewPage() {
  const { data, isLoading } = useOverviewStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vue d&apos;ensemble</h1>
        <p className="text-muted-foreground">Indicateurs nécessitant votre attention.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Annonces en attente de validation"
          value={data?.pendingListings}
          isLoading={isLoading}
        />
        <KpiCard
          label="Vérifications étudiantes en attente"
          value={data?.pendingVerifications}
          isLoading={isLoading}
        />
        <KpiCard
          label="Demandes de recherche guidée ouvertes"
          value={data?.openGuidedSearchRequests}
          isLoading={isLoading}
        />
        <KpiCard
          label="Réservations (30 derniers jours)"
          value={data?.recentBookingsCount}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
