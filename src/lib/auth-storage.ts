import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_SESSION_KEY = "welm.authSession.v1";

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string | null;
  user: {
    id: string;
    name: string;
    firstName?: string;
    phone?: string;
    email?: string;
    nationalId?: string;
    dateOfBirth?: string;
    dateOfBirthHijri?: string;
    licenseNumber?: string;
    licenseType?: "private" | "public" | "motorcycle" | "heavy";
    nationality?: string;
  };
};

export async function loadAuthSession(): Promise<StoredAuthSession | null> {
  const raw = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;
    if (typeof parsed.accessToken !== "string" || !parsed.user) {
      return null;
    }
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user,
    };
  } catch {
    return null;
  }
}

export async function saveAuthSession(session: StoredAuthSession): Promise<void> {
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}
