import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "../../stores/auth-store";
import {
  fetchWelmNotifications,
  markWelmNotificationsRead,
} from "./api";

export const WELM_NOTIFICATIONS_QUERY_KEY = ["welm", "notifications"] as const;
export const WELM_INBOX_POLL_MS = 4_000;

function useWelmNotificationsQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...WELM_NOTIFICATIONS_QUERY_KEY, accessToken ? "auth" : "anon"],
    enabled: Boolean(accessToken),
    queryFn: fetchWelmNotifications,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchInterval: accessToken ? WELM_INBOX_POLL_MS : false,
    refetchIntervalInBackground: false,
  });

  useFocusEffect(
    useCallback(() => {
      if (!accessToken) {
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: WELM_NOTIFICATIONS_QUERY_KEY,
      });
    }, [accessToken, queryClient]),
  );

  return query;
}

export function useWelmUnreadCount(): number {
  const query = useWelmNotificationsQuery();
  return query.data?.unreadCount ?? 0;
}

export function useWelmNotifications() {
  const queryClient = useQueryClient();
  const query = useWelmNotificationsQuery();

  const markRead = useMutation({
    mutationFn: markWelmNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: WELM_NOTIFICATIONS_QUERY_KEY,
      });
    },
  });

  const hasData = Boolean(query.data);

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isPending && !hasData,
    isError: query.isError,
    refetch: query.refetch,
    markRead: markRead.mutateAsync,
  };
}
