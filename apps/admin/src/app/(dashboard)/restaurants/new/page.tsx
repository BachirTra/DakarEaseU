'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RestaurantForm } from '@/features/restaurants/components/restaurant-form';

export default function NewRestaurantPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouveau restaurant</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <RestaurantForm onSaved={(id) => router.push(`/restaurants/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
