import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

import { getStoredLanguage } from "../../lib/language-storage";
import { useAuthStore } from "../../stores/auth-store";
import {
  deleteWelmPushTokenOnServer,
  registerWelmPushTokenOnServer,
} from "./api";
import {
  clearStoredExpoPushToken,
  getPushPermissionAsked,
  getStoredExpoPushToken,
  setPushPermissionAsked,
  setStoredExpoPushToken,
} from "./storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PLACEHOLDER_PROJECT_IDS = new Set([
  "",
  "REPLACE_WITH_EAS_PROJECT_ID",
  "00000000-0000-0000-0000-000000000000",
]);

const EAS_PROJECT_ID_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isWelmRemotePushConfigured(): boolean {
  return easProjectId() !== null;
}

function easProjectId(): string | null {
  const extra = Constants.expoConfig?.extra as
    | { eas?: { projectId?: string } }
    | undefined;
  const id = (
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    extra?.eas?.projectId ??
    ""
  ).trim();
  if (
    !id ||
    PLACEHOLDER_PROJECT_IDS.has(id) ||
    id.includes("REPLACE") ||
    !EAS_PROJECT_ID_UUID.test(id)
  ) {
    return null;
  }
  return id;
}

function devicePlatform(): "ios" | "android" {
  return Platform.OS === "ios" ? "ios" : "android";
}

async function deviceLanguage(): Promise<"en" | "ar"> {
  return (await getStoredLanguage()) ?? "ar";
}

async function ignoreFailure(work: () => Promise<void>): Promise<void> {
  try {
    await work();
  } catch {
    // Push must never block bookings, language switch, or logout.
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync("default", {
    name: "WELM",
    importance: Notifications.AndroidImportance.HIGH,
  });
}

async function ensurePermissionGranted(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === "granted") {
    if (!(await getPushPermissionAsked())) {
      await setPushPermissionAsked();
    }
    return true;
  }

  if (await getPushPermissionAsked()) {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync();
  await setPushPermissionAsked();
  return requested.status === "granted";
}

/**
 * Ask notification permission once after a real session exists, then POST the Expo token.
 */
export async function registerWelmPushToken(): Promise<void> {
  if (Platform.OS === "web" || !useAuthStore.getState().accessToken) {
    return;
  }
  if (!(await ensurePermissionGranted())) {
    return;
  }

  const projectId = easProjectId();
  if (!projectId) {
    return;
  }

  await ignoreFailure(async () => {
    await ensureAndroidChannel();
    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data?.trim();
    if (!token) {
      return;
    }
    await registerWelmPushTokenOnServer({
      token,
      platform: devicePlatform(),
      language: await deviceLanguage(),
    });
    await setStoredExpoPushToken(token);
  });
}

export async function syncWelmPushTokenLanguage(): Promise<void> {
  const token = await getStoredExpoPushToken();
  if (!token || !useAuthStore.getState().accessToken) {
    return;
  }
  await ignoreFailure(async () => {
    await registerWelmPushTokenOnServer({
      token,
      platform: devicePlatform(),
      language: await deviceLanguage(),
    });
  });
}

export async function unregisterWelmPushToken(): Promise<void> {
  const token = await getStoredExpoPushToken();
  if (!token) {
    return;
  }
  try {
    await deleteWelmPushTokenOnServer(token);
  } finally {
    await clearStoredExpoPushToken();
  }
}
