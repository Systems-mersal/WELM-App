import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "../../components/common/Screen";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import { SignupProgress } from "../../features/auth";
import { useRtl } from "../../hooks/useRtl";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileGate">;

export function ProfileGateScreen({ navigation }: Props) {
  const { t } = useTranslation("profile-gate");
  const { chevronEnd } = useRtl();
  const user = useAuthStore((state) => state.user);

  const handleDone = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  }, [navigation]);

  return (
    <Screen
      scrollable={false}
      edges={["bottom"]}
      className="bg-white"
      contentClassName="px-0"
      header={
        <StackScreenHeader title={t("header")} />
      }
    >
      <View className="flex-1 px-6">
        <View className="mt-4">
          <SignupProgress current="profile" />
        </View>

        <View className="mt-8 items-start gap-3">
          <AppText
            className="text-start text-text"
            style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xxl, lineHeight: 32 }}
          >
            {t("title")}
          </AppText>
          <AppText
            className="text-start text-textMuted"
            style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.label, lineHeight: 22 }}
          >
            {t("subtitle")}
          </AppText>
        </View>

        <View className="mt-8 gap-4 rounded-2xl border border-border bg-background px-4 py-4">
          <View>
            <AppText variant="caption" muted>
              {t("name-label")}
            </AppText>
            <AppText variant="body" className="mt-1 text-text">
              {user?.name ?? "—"}
            </AppText>
          </View>
          <View>
            <AppText variant="caption" muted>
              {t("email-label")}
            </AppText>
            <AppText variant="body" className="mt-1 text-text">
              {user?.email ?? "—"}
            </AppText>
          </View>
        </View>
      </View>

      <View className="border-t border-border bg-white px-6 pt-5 pb-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("done")}
          onPress={handleDone}
          className="h-14 flex-row items-center justify-center gap-2 rounded-pill bg-primary active:opacity-90"
          style={{
            shadowColor: colors.primaryDark,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <AppText
            variant="button"
            className="text-center text-white"
            style={{ includeFontPadding: false, lineHeight: 22 }}
          >
            {t("done")}
          </AppText>
          <AppIcon name={chevronEnd} size={20} color={colors.white} />
        </Pressable>
      </View>
    </Screen>
  );
}
