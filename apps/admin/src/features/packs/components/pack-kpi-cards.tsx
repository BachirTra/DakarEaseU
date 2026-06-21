'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/features/overview/components/kpi-card';
import { usePackStats } from '../hooks/use-packs';

export function PackKpiCards() {
  const { data, isLoading } = usePackStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total commandes" value={data?.totalOrders} isLoading={isLoading} />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Chiffre d&apos;affaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-3xl font-bold">
              {(data?.totalRevenue ?? 0).toLocaleString('fr-FR')} FCFA
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pack le plus commandé
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="truncate text-2xl font-bold">{data?.topPack ?? '—'}</p>
          )}
        </CardContent>
      </Card>
      <KpiCard label="Cette semaine" value={data?.ordersThisWeek} isLoading={isLoading} />
    </div>
  );
}
