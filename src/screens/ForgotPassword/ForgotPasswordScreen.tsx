import React, { useCallback, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/buttons/AppButton";
import { InlineErrorBanner } from "../../components/common/InlineErrorBanner";
import { Screen } from "../../components/common/Screen";
import { AppInput } from "../../components/forms/AppInput";
import { AppIcon } from "../../components/icons/AppIcon";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import {
  completeWelmPasswordReset,
  reportWelmAuthFailure,
  startWelmPasswordReset,
  WelmAuthApiError,
  welmAuthUserMessage,
} from "../../features/auth";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function resetErrorKey(error: unknown): string | null {
  if (!(error instanceof WelmAuthApiError)) {
    return null;
  }
  switch (error.serverCode) {
    case "invalid_code":
      return "forgot-code-invalid";
    case "expired":
    case "no_pending":
      return "forgot-code-expired";
    case "too_many_attempts":
      return "forgot-too-many";
    case "password_too_short":
      return "forgot-password-short";
    case "email_send_failed":
      return "forgot-send-failed";
    case "resend_cooldown":
    case "rate_limited":
      return "forgot-send-failed";
    default:
      return null;
  }
}

export function ForgotPasswordScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["login", "common"]);
  const [email, setEmail] = useState(route.params?.email ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);
  const [debugCode, setDebugCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (resendIn <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setResendIn((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  const showFailure = useCallback(
    (caught: unknown) => {
      const key = resetErrorKey(caught);
      const message = key
        ? t(key)
        : welmAuthUserMessage(caught, {
            unavailable: t("common:auth.api-unavailable"),
            fallback: t("common:error"),
          });
      setError(message);
      reportWelmAuthFailure(caught, message, t("common:error"));
    },
    [t],
  );

  const sendCode = useCallback(async () => {
    const normalized = email.trim();
    if (!isValidEmail(normalized)) {
      setError(t("email-invalid"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const started = await startWelmPasswordReset(normalized);
      setEmail(started.email);
      setSent(true);
      setDebugCode(started.debugCode ?? "");
      setResendIn(started.resendInSeconds ?? 60);
    } catch (caught) {
      showFailure(caught);
    } finally {
      setBusy(false);
    }
  }, [email, showFailure, t]);

  const savePassword = useCallback(async () => {
    if (!/^\d{4}$/.test(code.trim())) {
      setError(t("forgot-code-invalid"));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("forgot-password-short"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("forgot-password-mismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await completeWelmPasswordReset(email.trim(), code.trim(), password);
      Alert.alert(t("forgot-success-title"), t("forgot-success"), [
        { text: t("sign-in"), onPress: () => navigation.goBack() },
      ]);
    } catch (caught) {
      showFailure(caught);
    } finally {
      setBusy(false);
    }
  }, [code, confirmPassword, email, navigation, password, showFailure, t]);

  return (
    <Screen
      keyboard
      edges={["bottom"]}
      className="bg-white"
      header={
        <StackScreenHeader
          title={t("forgot-title")}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <View className="mt-6 gap-4">
        <AppText variant="body" muted className="text-start">
          {sent ? t("forgot-sent", { email: email.trim() }) : t("forgot-subtitle")}
        </AppText>
        {sent ? null : (
          <AppInput
            label={t("email")}
            value={email}
            onChangeText={setEmail}
            placeholder={t("email-placeholder")}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
          />
        )}
        {sent ? (
          <>
            <AppInput
              label={t("forgot-code")}
              value={code}
              onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 4))}
              placeholder={t("forgot-code-placeholder")}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
            />
            <AppInput
              label={t("forgot-new-password")}
              value={password}
              onChangeText={setPassword}
              placeholder={t("password-placeholder")}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
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
              label={t("forgot-confirm-password")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("forgot-confirm-password")}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
            />
            {__DEV__ && debugCode ? (
              <AppText variant="caption" className="text-start text-primary">
                {t("forgot-dev-code", { code: debugCode })}
              </AppText>
            ) : null}
          </>
        ) : null}
        {error ? (
          <InlineErrorBanner
            message={error}
            onDismiss={() => setError(null)}
            dismissAccessibilityLabel={t("auth-error-dismiss")}
          />
        ) : null}
        <AppButton
          label={sent ? t("forgot-submit") : t("forgot-send")}
          loading={busy}
          onPress={() => {
            void (sent ? savePassword() : sendCode());
          }}
        />
        {sent ? (
          <Pressable
            accessibilityRole="button"
            disabled={busy || resendIn > 0}
            onPress={() => {
              void sendCode();
            }}
            className="items-center py-2"
          >
            <AppText
              variant="label"
              className={resendIn > 0 ? "text-textMuted" : "text-primary"}
            >
              {resendIn > 0
                ? t("forgot-resend-in", { time: formatTimer(resendIn) })
                : t("forgot-resend")}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}
