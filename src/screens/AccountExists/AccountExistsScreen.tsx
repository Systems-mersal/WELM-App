import React, { useCallback, useEffect } from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/buttons/AppButton";
import { Screen } from "../../components/common/Screen";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import {
  commitPendingWelmSession,
  discardWelmAuth,
  firstNameFromWelmUser,
  routeAfterAccountContinue,
} from "../../features/auth";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "AccountExists">;

export function AccountExistsScreen({ navigation }: Props) {
  const { t } = useTranslation(["account-exists", "common"]);
  const pending = useAuthStore((state) => state.pendingSession);

  const email = pending?.user.email ?? "";
  const firstName = pending ? firstNameFromWelmUser(pending.user) : "";
  const profileComplete = pending?.profileComplete === true;

  useEffect(() => {
    if (!useAuthStore.getState().pendingSession) {
      navigation.replace("Login");
    }
  }, [navigation]);

  const handleSignIn = useCallback(async () => {
    await discardWelmAuth();
    navigation.replace("Login");
  }, [navigation]);

  const handleOtherSocial = useCallback(async () => {
    await discardWelmAuth();
    navigation.replace("CreateAccount");
  }, [navigation]);

  const handleContinue = useCallback(() => {
    const complete = profileComplete;
    if (!commitPendingWelmSession()) {
      navigation.replace("Login");
      return;
    }
    routeAfterAccountContinue(navigation, complete);
  }, [navigation, profileComplete]);

  return (
    <Screen
      edges={["bottom"]}
      className="bg-white"
      header={
        <StackScreenHeader
          title={t("header")}
          onBack={() => {
            void handleOtherSocial();
          }}
        />
      }
    >
      <View className="mt-10 items-center">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primaryMuted">
          <AppIcon name="check" size={32} color={colors.primary} />
        </View>
      </View>

      <View className="mt-8 items-center gap-3 px-2">
        <AppText
          className="text-center text-text"
          style={{
            fontFamily: fontFamily.bold,
            fontSize: fontSize.xxl,
            lineHeight: 32,
          }}
        >
          {t("title")}
        </AppText>
        <AppText
          className="text-center text-textMuted"
          style={{
            fontFamily: fontFamily.regular,
            fontSize: fontSize.label,
            lineHeight: 22,
          }}
        >
          {t("subtitle", { email })}
        </AppText>
      </View>

      <View className="mt-10 gap-3">
        <AppButton
          label={t("sign-in")}
          onPress={() => {
            void handleSignIn();
          }}
        />
        <AppButton
          label={t("use-other-social")}
          variant="outline"
          onPress={() => {
            void handleOtherSocial();
          }}
        />
      </View>

      {firstName ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleContinue}
          hitSlop={8}
          className="mt-6 items-center"
        >
          <AppText
            className="text-primary"
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: fontSize.label,
              lineHeight: 22,
            }}
          >
            {t("continue-as", { name: firstName })}
          </AppText>
        </Pressable>
      ) : null}
    </Screen>
  );
}
