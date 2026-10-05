import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../../../stores/auth-store";
import { fetchWelmBooking, fetchWelmBookings } from "../api/welm-bookings";

export const WELM_BOOKINGS_QUERY_KEY = ["welm", "bookings"] as const;

export function useWelmBookings() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const query = useQuery({
    queryKey: [...WELM_BOOKINGS_QUERY_KEY, accessToken ? "auth" : "anon"],
    enabled: Boolean(accessToken),
    queryFn: fetchWelmBookings,
  });

  return {
    bookings: query.data ?? [],
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    isEmpty: !query.isLoading && (query.data?.length ?? 0) === 0,
  };
}

export function useWelmBooking(bookingId: string | undefined) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: [...WELM_BOOKINGS_QUERY_KEY, "detail", bookingId],
    enabled: Boolean(accessToken && bookingId),
    queryFn: () => fetchWelmBooking(bookingId!),
  });
}
