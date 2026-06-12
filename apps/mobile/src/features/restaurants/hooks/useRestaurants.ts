import { useQuery } from "@tanstack/react-query";
import * as restaurantsService from "@/features/restaurants/services/restaurants.service";

export function useRestaurants() {
  return useQuery({ queryKey: ["restaurants", "list"], queryFn: restaurantsService.fetchRestaurants });
}

export function useRestaurantDetail(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["restaurants", "detail", restaurantId],
    queryFn: () => restaurantsService.fetchRestaurantDetail(restaurantId as string),
    enabled: Boolean(restaurantId),
  });
}
