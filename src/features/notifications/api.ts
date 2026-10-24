import { apiClient } from "../../lib/api-client";

export type WelmNotificationTarget = "booking" | "documents";

export type WelmNotificationDto = {
  id: string;
  type: string;
  title: string;
  body: string;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
  metadata: {
    bookingId: string | null;
    target: WelmNotificationTarget;
  };
};

export type WelmNotificationsResponse = {
  notifications: WelmNotificationDto[];
  unreadCount: number;
};

export async function fetchWelmNotifications(): Promise<WelmNotificationsResponse> {
  const { data } = await apiClient.get<WelmNotificationsResponse>(
    "/api/welm/notifications",
  );
  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
  };
}

export async function markWelmNotificationsRead(input: {
  ids?: string[];
  all?: boolean;
}): Promise<void> {
  await apiClient.post("/api/welm/notifications/read", {
    ...(input.all ? { all: true } : {}),
    ...(input.ids?.length ? { ids: input.ids } : {}),
  });
}

export async function registerWelmPushTokenOnServer(input: {
  token: string;
  platform: "ios" | "android" | "web";
  language: "en" | "ar";
}): Promise<void> {
  await apiClient.post("/api/welm/push-tokens", input);
}

export async function deleteWelmPushTokenOnServer(token: string): Promise<void> {
  await apiClient.delete("/api/welm/push-tokens", { data: { token } });
}
