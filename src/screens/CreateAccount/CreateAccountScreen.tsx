import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { appleIconXml } from "../../assets/figma/login/appleIconXml";
import { xIconXml } from "../../assets/figma/login/xIconXml";
import { WelmLogo } from "../../components/brand/WelmLogo";
import { AppButton } from "../../components/buttons/AppButton";
import { InlineErrorBanner } from "../../components/common/InlineErrorBanner";
import { Screen } from "../../components/common/Screen";
import { AppInput } from "../../components/forms/AppInput";
import { TermsCheckbox } from "../../components/forms/TermsCheckbox";
import { AppIcon } from "../../components/icons/AppIcon";
import { LocalSvg } from "../../components/icons/LocalSvg";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import {
  exchangeSocialCredential,
  mapWelmSessionToAuthUser,
  routeAfterWelmAuth,
  routeToHome,
  signInWithAppleToWelm,
  signInWithSocial,
  SocialAuthStatus,
  SocialProvider,
  startWelmEmailOtp,
  useAuthStore,
  welmAuthUserMessage,
} from "../../features/auth";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "CreateAccount">;

const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function CreateAccountScreen({ navigation }: Props) {
  const { t } = useTranslation(["create-account", "common"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [socialBusy, setSocialBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const appleSheetOpen = useRef(false);

  const formReady =
    isValidEmail(email) &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password === confirmPassword &&
    acceptedTerms;

  const handleToggleTerms = useCallback(() => {
    setAcceptedTerms((current) => {
      const next = !current;
      if (next) {
        setTermsError(false);
      }
      return next;
    });
  }, []);

  const requireTerms = useCallback(() => {
    if (!acceptedTerms) {
      setTermsError(true);
      return false;
    }
    return true;
  }, [acceptedTerms]);

  const handleApplePress = useCallback(async () => {
    if (!requireTerms()) {
      return;
    }
    if (socialBusy || appleSheetOpen.current) {
      return;
    }

    setAuthError(null);
    appleSheetOpen.current = true;
    try {
      const result = await signInWithAppleToWelm({
        onNativeSuccess: () => setSocialBusy(true),
      });

      if (result.status === SocialAuthStatus.CANCELLED) {
        return;
      }
      if (result.status === SocialAuthStatus.UNAVAILABLE) {
        setAuthError(t("common:auth.apple-unavailable"));
        return;
      }
      if (result.status === SocialAuthStatus.FAILED) {
        setAuthError(t("common:auth.apple-failed"));
        return;
      }

      routeAfterWelmAuth(navigation, result.session, "apple");
    } catch (error) {
      const message = welmAuthUserMessage(error, {
        unavailable: t("common:auth.api-unavailable"),
        fallback: t("common:error"),
      });
      setAuthError(message);
    } finally {
      appleSheetOpen.current = false;
      setSocialBusy(false);
    }
  }, [navigation, requireTerms, socialBusy, t]);

  /** Design uses X mark; auth still goes through Google OAuth. */
  const handleGooglePress = useCallback(async () => {
    if (!requireTerms()) {
      return;
    }
    if (socialBusy) {
      return;
    }

    setAuthError(null);
    setSocialBusy(true);
    try {
      const result = await signInWithSocial(SocialProvider.GOOGLE);
      if (result.status === SocialAuthStatus.CANCELLED) {
        return;
      }
      if (result.status === SocialAuthStatus.UNAVAILABLE) {
        setAuthError(t("common:error"));
        return;
      }
      if (result.status === SocialAuthStatus.FAILED) {
        setAuthError(result.message?.trim() || t("common:error"));
        return;
      }

      try {
        const session = await exchangeSocialCredential(result);
        useAuthStore
          .getState()
          .setSession(
            session.accessToken,
            mapWelmSessionToAuthUser(session),
            session.refreshToken,
          );
        routeToHome(navigation);
      } catch (error) {
        const message = welmAuthUserMessage(error, {
          unavailable: t("common:auth.api-unavailable"),
          fallback: t("common:error"),
        });
        setAuthError(message);
      }
    } finally {
      setSocialBusy(false);
    }
  }, [navigation, requireTerms, socialBusy, t]);

  const validateEmailForm = useCallback(() => {
    let valid = true;
    const normalizedEmail = email.trim();

    if (!isValidEmail(normalizedEmail)) {
      setEmailError(t("email-invalid"));
      valid = false;
    } else {
      setEmailError(null);
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(t("password-too-short"));
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (password !== confirmPassword) {
      setConfirmError(t("password-mismatch"));
      valid = false;
    } else {
      setConfirmError(null);
    }

    if (!requireTerms()) {
      valid = false;
    }

    return valid ? normalizedEmail : null;
  }, [confirmPassword, email, password, requireTerms, t]);

  const handleCreateWithEmail = useCallback(async () => {
    const normalizedEmail = validateEmailForm();
    if (!normalizedEmail || emailBusy) {
      return;
    }

    setAuthError(null);
    setEmailBusy(true);
    try {
      const started = await startWelmEmailOtp(normalizedEmail);
      navigation.navigate("Otp", {
        email: started.email,
        intent: "signup",
        debugCode: started.debugCode,
      });
    } catch (error) {
      const message = welmAuthUserMessage(error, {
        unavailable: t("common:auth.api-unavailable"),
        fallback: t("common:error"),
      });
      setAuthError(message);
    } finally {
      setEmailBusy(false);
    }
  }, [emailBusy, navigation, t, validateEmailForm]);

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
          <View className="mt-6 items-center">
            <WelmLogo width={180} />
          </View>

          <View className="mt-6 items-center gap-3 px-2">
            <AppText
              className="text-center text-text"
              style={{
                fontFamily: fontFamily.bold,
                fontSize: fontSize.xxl,
                lineHeight: 34,
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
              {t("subtitle")}
            </AppText>
          </View>

          <View className="mt-8 gap-4">
            <AppInput
              label={t("email")}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) {
                  setEmailError(null);
                }
              }}
              placeholder={t("email-placeholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              error={emailError ?? undefined}
            />

            <AppInput
              label={t("password")}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError) {
                  setPasswordError(null);
                }
              }}
              placeholder={t("password-placeholder")}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              error={passwordError ?? undefined}
              rightElement={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? t("hide-password") : t("show-password")
                  }
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={8}
                  className="h-8 w-8 items-center justify-center"
                >
                  <AppIcon
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              }
            />

            <AppInput
              label={t("confirm-password")}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (confirmError) {
                  setConfirmError(null);
                }
              }}
              placeholder={t("confirm-password-placeholder")}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              error={confirmError ?? undefined}
              rightElement={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword ? t("hide-password") : t("show-password")
                  }
                  onPress={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  hitSlop={8}
                  className="h-8 w-8 items-center justify-center"
                >
                  <AppIcon
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              }
            />
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
                accessibilityLabel={t("a11y-apple")}
                onPress={() => {
                  void handleApplePress();
                }}
                className={`h-14 w-14 items-center justify-center rounded-full border border-border bg-white ${
                  socialDimmed ? "opacity-40" : "active:opacity-70"
                }`}
              >
                <LocalSvg xml={appleIconXml} width={22} height={22} />
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("a11y-x")}
              onPress={() => {
                void handleGooglePress();
              }}
              className={`h-14 w-14 items-center justify-center rounded-full border border-border bg-white ${
                socialDimmed ? "opacity-40" : "active:opacity-70"
              }`}
            >
              <LocalSvg xml={xIconXml} width={18} height={18} />
            </Pressable>
          </View>

          {authError ? (
            <InlineErrorBanner
              message={authError}
              onDismiss={() => setAuthError(null)}
              dismissAccessibilityLabel={t("social-error-dismiss")}
            />
          ) : null}

          <View className="mt-8">
            <TermsCheckbox
              checked={acceptedTerms}
              error={termsError}
              onToggle={handleToggleTerms}
              accessibilityLabel={t("a11y-terms")}
              errorMessage={t("terms-error")}
            >
              <AppText variant="caption" className="text-start text-text">
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
                  onPress={() =>
                    navigation.navigate("Legal", { kind: "privacy" })
                  }
                  suppressHighlighting
                >
                  {t("privacy-link")}
                </AppText>
              </AppText>
            </TermsCheckbox>
          </View>
        </View>

        <View className="mt-8 pb-2">
          <AppButton
            label={t("create-account")}
            onPress={() => {
              void handleCreateWithEmail();
            }}
            loading={emailBusy}
            variant={formReady ? "primary" : "muted"}
          />
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
