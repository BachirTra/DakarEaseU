'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBonPlan } from '@/features/bon-plans/hooks/use-bon-plans';
import { BonPlanForm } from '@/features/bon-plans/components/bon-plan-form';
import { BonPlanMediaManager } from '@/features/bon-plans/components/bon-plan-media-manager';

export default function BonPlanDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: bonPlan, isLoading } = useBonPlan(params.id);

  if (isLoading || !bonPlan) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{bonPlan.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <BonPlanForm bonPlan={bonPlan} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Médias secondaires</CardTitle>
        </CardHeader>
        <CardContent>
          <BonPlanMediaManager bonPlanId={bonPlan.id} />
        </CardContent>
      </Card>
    </div>
  );
}
