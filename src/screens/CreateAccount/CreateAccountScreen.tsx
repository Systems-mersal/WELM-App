import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { loginLogoMarkXml } from "../../assets/figma/login/logoMarkXml";
import { AppButton } from "../../components/buttons/AppButton";
import { Screen } from "../../components/common/Screen";
import { SaudiPhoneField } from "../../components/forms/SaudiPhoneField";
import { TermsCheckbox } from "../../components/forms/TermsCheckbox";
import { AppIcon } from "../../components/icons/AppIcon";
import { LocalSvg } from "../../components/icons/LocalSvg";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
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
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";
import { isValidSaudiMobile, normalizeSaudiMobile } from "../../utils/saudi-mobile";

type Props = NativeStackScreenProps<RootStackParamList, "CreateAccount">;

export function CreateAccountScreen({ navigation }: Props) {
  const { t } = useTranslation(["create-account", "common"]);
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);
  const appleSheetOpen = useRef(false);

  const canSubmit = acceptedTerms && isValidSaudiMobile(phone);

  // Apple stays on iOS even when Google is shown (App Store guideline).
  const socialButtons = useMemo(
    () => [
      ...(Platform.OS === "ios"
        ? [
            {
              key: SocialProvider.APPLE,
              icon: "apple" as const,
              label: t("common:a11y.sign-in-apple"),
            },
          ]
        : []),
      {
        key: SocialProvider.GOOGLE,
        icon: "google" as const,
        label: t("common:a11y.sign-in-google"),
      },
    ],
    [t],
  );

  const handleToggleTerms = useCallback(() => {
    setAcceptedTerms((current) => {
      const next = !current;
      if (next) {
        setTermsError(false);
      }
      return next;
    });
  }, []);

  const handleApplePress = useCallback(async () => {
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }
    if (socialBusy || appleSheetOpen.current) {
      return;
    }

    // Phone stays on this screen for OTP only — never sent to Apple or Tajeer social.
    // Overlay starts only after the native sheet returns (not during the password prompt).
    appleSheetOpen.current = true;
    try {
      const result = await signInWithAppleToWelm({
        onNativeSuccess: () => setSocialBusy(true),
      });

      // Cancel (ERR_REQUEST_CANCELED) → stay on Create Account, no US-6 banner.
      if (result.status === SocialAuthStatus.CANCELLED) {
        return;
      }
      if (result.status === SocialAuthStatus.UNAVAILABLE) {
        reportWelmAuthFailure(
          result,
          t("common:auth.apple-unavailable"),
          t("common:error"),
        );
        return;
      }
      if (result.status === SocialAuthStatus.FAILED) {
        reportWelmAuthFailure(
          result,
          t("common:auth.apple-failed"),
          t("common:error"),
        );
        return;
      }

      // US-2.6: completeSocialSignIn then LinkMobile / AccountExists.
      if (__DEV__) {
        console.log("[welm] Apple session ok", {
          userId: result.session.user.id,
          email: result.session.user.email,
          isNew: result.session.isNew,
        });
      }

      routeAfterWelmAuth(navigation, result.session, "apple");
    } catch (error) {
      if (__DEV__) {
        console.warn("[welm] Apple → API failed", error);
      }
      const message = welmAuthUserMessage(error, {
        unavailable: t("common:auth.api-unavailable"),
        fallback: t("common:error"),
      });
      reportWelmAuthFailure(error, message, t("common:error"));
    } finally {
      appleSheetOpen.current = false;
      setSocialBusy(false);
    }
  }, [acceptedTerms, navigation, socialBusy, t]);

  const handleSocialPress = useCallback(
    async (provider: SocialProvider) => {
      if (provider === SocialProvider.APPLE) {
        await handleApplePress();
        return;
      }

      if (!acceptedTerms) {
        setTermsError(true);
        return;
      }
      if (socialBusy) {
        return;
      }

      setSocialBusy(true);
      try {
        const result = await signInWithSocial(provider);
        if (result.status === SocialAuthStatus.CANCELLED) {
          return;
        }
        if (result.status === SocialAuthStatus.UNAVAILABLE) {
          reportWelmAuthFailure(
            result,
            t("common:error"),
            t("common:error"),
          );
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
      } finally {
        setSocialBusy(false);
      }
    },
    [
      acceptedTerms,
      handleApplePress,
      navigation,
      socialBusy,
      t,
    ],
  );

  const handleContinue = useCallback(() => {
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }

    const normalized = normalizeSaudiMobile(phone);
    if (!isValidSaudiMobile(normalized)) {
      return;
    }

    navigation.navigate("Otp", {
      phone: `+966${normalized}`,
      intent: "signup",
    });
  }, [acceptedTerms, navigation, phone]);

  const socialDimmed = !acceptedTerms;

  return (
    <View className="flex-1">
    <Screen
      keyboard
      edges={["bottom"]}
      className="bg-white"
      contentClassName="justify-between"
      header={
        <StackScreenHeader
          title={t("header")}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <View>
        <View className="mt-6 flex-row items-center justify-center gap-2">
          <AppText
            className="tracking-[2px] text-primary"
            style={{ fontFamily: fontFamily.bold, fontSize: fontSize.body }}
          >
            {t("brand")}
          </AppText>
          <LocalSvg xml={loginLogoMarkXml} width={36} height={36} />
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

        <AppText variant="label" className="mb-4 mt-8 text-start">
          {t("social-section")}
        </AppText>

        <View className="flex-row items-center justify-center gap-4">
          {socialButtons.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => {
                void handleSocialPress(item.key);
              }}
              className={`h-14 w-14 items-center justify-center rounded-full border border-border ${
                socialDimmed ? "opacity-40" : "active:opacity-70"
              }`}
            >
              <AppIcon name={item.icon} size={24} color={colors.text} />
            </Pressable>
          ))}
        </View>

        <AppText variant="caption" muted className="mt-4 text-center">
          {t("social-caption")}
        </AppText>

        <View className="mt-8 flex-row items-center gap-4">
          <View className="h-px flex-1 bg-border" />
          <AppText variant="caption" muted>
            {t("or")}
          </AppText>
          <View className="h-px flex-1 bg-border" />
        </View>

        <View className="mt-8">
          <SaudiPhoneField
            value={phone}
            onChangeText={setPhone}
            label={t("phone")}
            placeholder={t("phone-placeholder")}
          />
        </View>

        <View className="mt-6">
          <TermsCheckbox
            checked={acceptedTerms}
            error={termsError}
            onToggle={handleToggleTerms}
            accessibilityLabel={t("a11y-terms")}
            errorMessage={t("terms-error")}
          >
            <AppText variant="caption" className="text-start">
              {t("terms-agree")}
              <AppText
                variant="caption"
                className="text-primary"
                onPress={() => navigation.navigate("Legal", { kind: "terms" })}
                suppressHighlighting
              >
                {t("terms-link")}
              </AppText>
              {t("terms-and")}
              <AppText
                variant="caption"
                className="text-primary"
                onPress={() => navigation.navigate("Legal", { kind: "privacy" })}
                suppressHighlighting
              >
                {t("privacy-link")}
              </AppText>
            </AppText>
          </TermsCheckbox>
        </View>

        <View className="mt-6">
          <AppButton
            label={t("continue-phone")}
            onPress={handleContinue}
            variant={canSubmit ? "primary" : "muted"}
          />
        </View>
      </View>

      <View className="mt-10 flex-row flex-wrap items-center justify-center gap-1">
        <AppText variant="body" muted>
          {t("has-account")}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <AppText variant="body" className="text-primary">
            {t("sign-in")}
          </AppText>
        </Pressable>
      </View>
    </Screen>
    {socialBusy ? (
      <View
        pointerEvents="auto"
        className="absolute inset-0 items-center justify-center bg-black/20"
      >
        <View className="rounded-2xl bg-white px-6 py-5">
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="caption" muted className="mt-3 text-center">
            {t("common:loading")}
          </AppText>
        </View>
      </View>
    ) : null}
    </View>
  );
}
