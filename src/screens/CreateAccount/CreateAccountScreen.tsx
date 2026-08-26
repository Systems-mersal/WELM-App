import React, { useCallback, useMemo, useState } from "react";
import { Alert, Platform, Pressable, View } from "react-native";
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
  signInWithSocial,
  SocialAuthStatus,
  SocialProvider,
} from "../../features/auth";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";
import { isValidSaudiMobile, normalizeSaudiMobile } from "../../utils/saudi-mobile";

type Props = NativeStackScreenProps<RootStackParamList, "CreateAccount">;

export function CreateAccountScreen({ navigation }: Props) {
  const { t } = useTranslation(["create-account", "common"]);
  const setPendingSocial = useAuthStore((state) => state.setPendingSocial);
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const canSubmit = acceptedTerms && isValidSaudiMobile(phone);

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
      {
        key: SocialProvider.X,
        icon: "x" as const,
        label: t("common:a11y.sign-in-x"),
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

  const handleSocialPress = useCallback(
    async (provider: SocialProvider) => {
      if (!acceptedTerms) {
        setTermsError(true);
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
        Alert.alert(t("common:error"));
        return;
      }

      // TODO(US-2.2): POST /api/welm/auth/social — then setSession(access, user, refresh)
      // TODO(US-3): if isNew === true → Link Mobile
      // TODO(US-5): if isNew === false → existing-user flow
      setPendingSocial(result);
    },
    [acceptedTerms, setPendingSocial, t],
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
  );
}
