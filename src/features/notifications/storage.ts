import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  permissionAsked: "welm.pushPermissionAsked",
  expoToken: "welm.expoPushToken",
  lastHandledId: "welm.lastHandledNotificationId",
} as const;

export async function getPushPermissionAsked(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.permissionAsked)) === "1";
}

export async function setPushPermissionAsked(): Promise<void> {
  await AsyncStorage.setItem(KEYS.permissionAsked, "1");
}

export async function getStoredExpoPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.expoToken);
}

export async function setStoredExpoPushToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.expoToken, token);
}

export async function clearStoredExpoPushToken(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.expoToken);
}

export async function getLastHandledNotificationId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.lastHandledId);
}

export async function setLastHandledNotificationId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastHandledId, id);
}
