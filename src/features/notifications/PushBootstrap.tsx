import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";

import { navigationRef } from "../../navigation/navigation-ref";
import { useAuthStore } from "../../stores/auth-store";
import { fetchWelmNotifications } from "./api";
import { WELM_NOTIFICATIONS_QUERY_KEY } from "./hooks";
import {
  presentNewInboxItems,
  resetInboxLiveSession,
} from "./inbox-live";
import {
  consumePendingPush,
  isAuthGateRoute,
  parseWelmPushData,
  rememberPushPayload,
} from "./open-from-push";
import { registerWelmPushToken } from "./register";
import {
  getLastHandledNotificationId,
  setLastHandledNotificationId,
} from "./storage";

function payloadFromResponse(
  response: Notifications.NotificationResponse | null,
) {
  const data = response?.notification.request.content.data;
  if (!data || typeof data !== "object") {
    return null;
  }
  return parseWelmPushData(data as Record<string, unknown>);
}

function tryOpenPending(): void {
  if (!useAuthStore.getState().accessToken || !navigationRef.isReady()) {
    return;
  }
  if (isAuthGateRoute(navigationRef.getCurrentRoute()?.name)) {
    return;
  }
  consumePendingPush(navigationRef);
}

async function deliverResponse(
  response: Notifications.NotificationResponse | null,
): Promise<void> {
  const payload = payloadFromResponse(response);
  if (!payload) {
    return;
  }

  const identifier = response?.notification.request.identifier ?? "";
  if (identifier) {
    const last = await getLastHandledNotificationId();
    if (last === identifier) {
      return;
    }
    await setLastHandledNotificationId(identifier);
  }

  rememberPushPayload(payload);
  tryOpenPending();
}

export function PushBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const inbox = useQuery({
    queryKey: [...WELM_NOTIFICATIONS_QUERY_KEY, accessToken ? "auth" : "anon"],
    enabled: Boolean(accessToken),
    queryFn: fetchWelmNotifications,
    staleTime: 0,
    refetchInterval: accessToken ? 15_000 : false,
  });

  useEffect(() => {
    if (!accessToken) {
      resetInboxLiveSession();
      return;
    }
    void registerWelmPushToken();
  }, [accessToken]);

  useEffect(() => {
    if (!inbox.data) {
      return;
    }
    void presentNewInboxItems(inbox.data.notifications);
  }, [inbox.data]);

  useEffect(() => {
    let cancelled = false;

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!cancelled) {
        void deliverResponse(response);
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        void deliverResponse(response);
      },
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    tryOpenPending();
  }, [accessToken]);

  return null;
}
