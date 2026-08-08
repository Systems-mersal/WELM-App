import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_SEEN_ONBOARDING_KEY = "welm.hasSeenOnboarding.v2";
const ALL_KEYS = [
  HAS_SEEN_ONBOARDING_KEY,
  "welm.hasSeenOnboarding.v1",
  "hasSeenOnboarding",
];

export async function getHasSeenOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
  return value === "true";
}

export async function setHasSeenOnboarding(): Promise<void> {
  await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "true");
}

export async function clearHasSeenOnboarding(): Promise<void> {
  await AsyncStorage.multiRemove(ALL_KEYS);
}
