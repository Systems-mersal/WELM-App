import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from "@expo-google-fonts/cairo";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { I18nextProvider } from "react-i18next";

import "./src/styles/global.css";
import i18n, { defaultLanguage } from "./src/i18n";
import { LocaleRoot } from "./src/components/locale/LocaleRoot";
import { getStoredLanguage } from "./src/lib/language-storage";
import { queryClient } from "./src/lib/query-client";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useAuthStore } from "./src/stores/auth-store";
import { colors } from "./src/theme/colors";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [localeReady, setLocaleReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = await getStoredLanguage();

      if (stored && stored !== i18n.language) {
        await i18n.changeLanguage(stored);
      } else if (!stored && defaultLanguage !== i18n.language) {
        await i18n.changeLanguage(defaultLanguage);
      }

      await useAuthStore.getState().hydrate();

      if (!cancelled) {
        setLocaleReady(true);
        setAuthReady(true);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!fontsLoaded || !localeReady || !authReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <LocaleRoot>
            <RootNavigator />
          </LocaleRoot>
        </QueryClientProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
