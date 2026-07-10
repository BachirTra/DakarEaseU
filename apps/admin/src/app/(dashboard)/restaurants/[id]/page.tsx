'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRestaurantDetail } from '@/features/restaurants/hooks/use-restaurants';
import { RestaurantForm } from '@/features/restaurants/components/restaurant-form';
import { RestaurantMediaManager } from '@/features/restaurants/components/restaurant-media-manager';
import { MenuItemsManager } from '@/features/menu-items/components/menu-items-manager';

export default function RestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useRestaurantDetail(params.id);

  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;
  const { restaurant, media } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{restaurant.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <RestaurantForm restaurant={restaurant} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <RestaurantMediaManager restaurantId={restaurant.id} media={media} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Menu</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemsManager restaurantId={restaurant.id} />
        </CardContent>
      </Card>
    </div>
  );
}
