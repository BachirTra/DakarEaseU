'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BonPlanForm } from '@/features/bon-plans/components/bon-plan-form';

export default function NewBonPlanPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouveau bon plan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <BonPlanForm onSaved={(id) => router.push(`/bon-plans/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
