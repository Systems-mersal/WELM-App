import React, { useMemo } from "react";
import { Alert, View } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "../../components/buttons/AppButton";
import { AppText } from "../../components/typography/AppText";
import { Screen } from "../../components/common/Screen";
import { useLanguage } from "../../hooks/useLanguage";
import { useAuthStore } from "../../stores/auth-store";
import type { MainTabNavigationProp } from "../../navigation/types";
import { ProfileHeader, ProfileStats } from "./components/ProfileHeader";
import { SettingsList } from "./components/SettingsRow";

export function ProfileScreen() {
  const { t } = useTranslation(["profile", "common"]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp<"Profile">>();
  const { language, toggleLanguage } = useLanguage();

  const settingsRows = useMemo(
    () => [
      { key: "personalInfo", label: t("rows.personal-info") },
      { key: "paymentMethods", label: t("rows.payment-methods") },
      {
        key: "notifications",
        label: t("rows.notifications"),
        onPress: () => navigation.navigate("Notifications"),
      },
      {
        key: "documents",
        label: t("rows.documents"),
        onPress: () => navigation.navigate("Documents"),
      },
      {
        key: "language",
        label: t("rows.language"),
        value: language === "ar" ? t("rows.language-ar") : t("rows.language-en"),
        onPress: () => {
          void toggleLanguage();
        },
      },
      { key: "support", label: t("rows.support") },
      { key: "terms", label: t("rows.terms") },
      { key: "privacy", label: t("rows.privacy") },
    ],
    [language, navigation, t, toggleLanguage],
  );

  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    Alert.alert(t("logout-title"), t("logout-message"), [
      { text: t("common:cancel"), style: "cancel" },
      {
        text: t("logout-confirm"),
        style: "destructive",
        onPress: () => {
          clearSession();
          navigation.getParent()?.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }],
            }),
          );
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <View
        className="bg-primaryDark px-6 pb-3"
        style={{ paddingTop: insets.top }}
      >
        <AppText variant="caption" className="mb-1 text-white/70">
          {t("title")}
        </AppText>
        <ProfileHeader />
      </View>

      <Screen
        scrollable
        edges={[]}
        className="bg-background"
        contentClassName="px-0"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <ProfileStats />

        <View className="px-6">
          <AppText variant="subtitle" className="mb-1 mt-6">
            {t("account-settings")}
          </AppText>
          <SettingsList rows={settingsRows} />

          <AppButton
            label={t("logout")}
            variant="outline"
            className="mt-6 border-danger"
            textClassName="text-danger"
            onPress={handleLogout}
          />

          <View className="mt-8 items-center pb-4">
            <AppText variant="caption" muted className="text-center">
              {t("copyright")}
            </AppText>
            <AppText variant="caption" muted className="mt-1">
              {t("version")}
            </AppText>
          </View>
        </View>
      </Screen>
    </View>
  );
}
