import * as Notifications from "expo-notifications";

import type { WelmNotificationDto } from "./api";
import { isWelmRemotePushConfigured } from "./register";

/** Ids already on the device this session — skip banners for the initial inbox. */
let seenIds: Set<string> | null = null;

export function resetInboxLiveSession(): void {
  seenIds = null;
}

export async function presentNewInboxItems(
  items: WelmNotificationDto[],
): Promise<void> {
  if (seenIds === null) {
    seenIds = new Set(items.map((item) => item.id));
    return;
  }

  const fresh = items.filter(
    (item) => !item.readAt && !seenIds!.has(item.id),
  );

  for (const item of items) {
    seenIds.add(item.id);
  }

  if (fresh.length === 0 || isWelmRemotePushConfigured()) {
    return;
  }

  for (const item of fresh) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.body,
        data: {
          target: item.metadata.target,
          bookingId: item.metadata.bookingId ?? item.entityId ?? "",
        },
      },
      trigger: null,
    });
  }
}
