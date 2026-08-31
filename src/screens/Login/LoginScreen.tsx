import React, { useCallback, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { loginLogoMarkXml } from "../../assets/figma/login/logoMarkXml";
import { xIconXml } from "../../assets/figma/login/xIconXml";
import { AppButton } from "../../components/buttons/AppButton";
import { Screen } from "../../components/common/Screen";
import { AppIcon } from "../../components/icons/AppIcon";
import { LocalSvg } from "../../components/icons/LocalSvg";
import { AppText } from "../../components/typography/AppText";
import {
  exchangeSocialCredential,
  reportWelmAuthFailure,
  routeAfterWelmAuth,
  signInWithAppleToWelm,
  signInWithSocial,
  SocialAuthStatus,
  SocialProvider,
  welmAuthUserMessage,
} from "../../features/auth";
import { useRtl } from "../../hooks/useRtl";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation(["login", "common"]);
  const { textAlign } = useRtl();
  const [phone, setPhone] = useState("");
  const [socialBusy, setSocialBusy] = useState(false);

  const handleContinue = useCallback(() => {
    navigation.navigate("Otp", { phone: phone.trim() || undefined });
  }, [navigation, phone]);

  const handleCreateAccount = useCallback(() => {
    navigation.navigate("CreateAccount");
  }, [navigation]);

  const handleSocialPress = useCallback(
    async (provider: SocialProvider) => {
      if (socialBusy) {
        return;
      }
      setSocialBusy(true);
      try {
        if (provider === SocialProvider.APPLE) {
          const result = await signInWithAppleToWelm();
          if (
            result.status === SocialAuthStatus.CANCELLED ||
            result.status === SocialAuthStatus.UNAVAILABLE
          ) {
            return;
          }
          if (result.status === SocialAuthStatus.FAILED) {
            reportWelmAuthFailure(result, t("common:error"), t("common:error"));
            return;
          }
          routeAfterWelmAuth(navigation, result.session, "apple");
          return;
        }

        const result = await signInWithSocial(provider);
        if (
          result.status === SocialAuthStatus.CANCELLED ||
          result.status === SocialAuthStatus.UNAVAILABLE
        ) {
          return;
        }
        if (result.status === SocialAuthStatus.FAILED) {
          reportWelmAuthFailure(result, t("common:error"), t("common:error"));
          return;
        }

        try {
          const session = await exchangeSocialCredential(result);
          routeAfterWelmAuth(navigation, session, provider);
        } catch (error) {
          const message = welmAuthUserMessage(error, {
            unavailable: t("common:auth.api-unavailable"),
            fallback: t("common:error"),
          });
          reportWelmAuthFailure(error, message, t("common:error"));
        }
      } catch (error) {
        if (provider === SocialProvider.APPLE) {
          const message = welmAuthUserMessage(error, {
            unavailable: t("common:auth.api-unavailable"),
            fallback: t("common:error"),
          });
          reportWelmAuthFailure(error, message, t("common:error"));
        }
      } finally {
        setSocialBusy(false);
      }
    },
    [navigation, socialBusy, t],
  );

  return (
    <Screen
      keyboard
      edges={["top", "bottom"]}
      className="bg-white"
      contentClassName="justify-between"
    >
      <View>
        <View className="mt-4 flex-row items-center justify-center gap-2">
          <AppText
            className="tracking-[2px] text-primary"
            style={{ fontFamily: fontFamily.bold, fontSize: fontSize.body }}
          >
            WELM
          </AppText>
          <LocalSvg xml={loginLogoMarkXml} width={36} height={36} />
        </View>

        <View className="mt-10 items-center gap-3">
          <AppText
            className="text-center text-text"
            style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xxl, lineHeight: 32 }}
          >
            {t("welcome")}
          </AppText>
          <AppText
            className="text-center text-textMuted"
            style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.label, lineHeight: 22 }}
          >
            {t("subtitle")}
          </AppText>
        </View>

        <View className="mt-10">
          <AppText variant="label" className="mb-2">
            {t("phone")}
          </AppText>
          <View className="h-14 flex-row items-center rounded-2xl border border-border bg-background px-4">
            <View className="flex-row items-center gap-2">
              <Text
                accessibilityLabel={t("common:a11y.country-sa")}
                style={{ fontSize: 18, lineHeight: 20 }}
              >
                🇸🇦
              </Text>
              <AppText variant="body" className="text-text">
                +966
              </AppText>
            </View>
            <View className="mx-3 h-6 w-px bg-border" />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder={t("phone")}
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              returnKeyType="done"
              className="flex-1 text-text"
              style={{
                fontFamily: fontFamily.regular,
                fontSize: fontSize.body,
                textAlign,
                writingDirection: "ltr",
              }}
            />
          </View>
        </View>

        <View className="mt-6">
          <AppButton label={t("continue")} onPress={handleContinue} />
        </View>

        <View className="mt-8 flex-row items-center gap-4">
          <View className="h-px flex-1 bg-border" />
          <AppText variant="caption" muted>
            {t("or")}
          </AppText>
          <View className="h-px flex-1 bg-border" />
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-4">
          {Platform.OS === "ios" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common:a11y.sign-in-apple")}
              onPress={() => {
                void handleSocialPress(SocialProvider.APPLE);
              }}
              className="h-14 w-14 items-center justify-center rounded-full border border-border active:opacity-70"
            >
              <AppIcon name="apple" size={24} />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common:a11y.sign-in-google")}
            onPress={() => {
              void handleSocialPress(SocialProvider.GOOGLE);
            }}
            className="h-14 w-14 items-center justify-center rounded-full border border-border active:opacity-70"
          >
            <AppIcon name="google" size={24} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common:a11y.sign-in-x")}
            onPress={() => {
              void handleSocialPress(SocialProvider.X);
            }}
            className="h-14 w-14 items-center justify-center rounded-full border border-border active:opacity-70"
          >
            <LocalSvg xml={xIconXml} width={24} height={24} />
          </Pressable>
        </View>
      </View>

      <View className="mt-10 flex-row flex-wrap items-center justify-center gap-1">
        <AppText variant="body" muted>
          {t("no-account")}
        </AppText>
        <Pressable accessibilityRole="button" onPress={handleCreateAccount} hitSlop={8}>
          <AppText variant="body" className="text-primary">
            {t("create-account")}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
