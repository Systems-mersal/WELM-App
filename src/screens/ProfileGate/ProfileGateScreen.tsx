import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "../../components/common/Screen";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import { SignupProgress } from "../../features/auth";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { fontFamily, fontSize } from "../../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileGate">;

/** US-8 stub — session is open; Home is blocked until Complete Profile / Location. */
export function ProfileGateScreen(_props: Props) {
  const { t } = useTranslation("profile-gate");
  const user = useAuthStore((state) => state.user);

  return (
    <Screen
      edges={["bottom"]}
      className="bg-white"
      header={
        <StackScreenHeader title={t("header")} />
      }
    >
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
    </Screen>
  );
}
