'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoriesManager } from '@/features/bon-plans/components/categories-manager';

export default function BonPlanCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catégories de bons plans</h1>
        <p className="text-muted-foreground">Gérez les catégories d'activités.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriesManager />
        </CardContent>
      </Card>
    </div>
  );
}
