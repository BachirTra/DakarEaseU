import { useQuery } from "@tanstack/react-query";
import * as bookingsService from "@/features/housing/services/bookings.service";
import { useSessionStore } from "@/features/auth/store/sessionStore";

export function useMyBookings() {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["bookings", "list", userId],
    queryFn: () => bookingsService.fetchMyBookings(userId as string),
    enabled: Boolean(userId),
  });
}
