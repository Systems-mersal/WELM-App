import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAppLocale, type AppLocale } from "../i18n/routing";

export type AppLanguage = AppLocale;

const LANGUAGE_KEY = "appLanguage";

export async function getStoredLanguage(): Promise<AppLanguage | null> {
  const value = await AsyncStorage.getItem(LANGUAGE_KEY);
  return isAppLocale(value) ? value : null;
}

export async function setStoredLanguage(language: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}
