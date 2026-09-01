import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/buttons/AppButton";
import { Screen } from "../../components/common/Screen";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import {
  reportWelmAuthFailure,
  routePastAuthGate,
  startWelmPhoneOtp,
  startWelmEmailOtp,
  verifyWelmPhoneOtp,
  verifyWelmEmailOtp,
  welmAuthUserMessage,
} from "../../features/auth";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { fontFamily, fontSize } from "../../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "Otp">;

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function digitsOnly(value: string, max = OTP_LENGTH): string {
  return value.replace(/\D/g, "").slice(0, max);
}

export function OtpScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["otp", "common"]);
  const phone = route.params?.phone ?? "";
  const email = route.params?.email ?? "";
  const destination = email || phone || "";
  const intent = route.params?.intent;
  const isSocial = intent === "social";
  const isEmailOtp = Boolean(email);

  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [busy, setBusy] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState(route.params?.debugCode ?? "");
  const inputRef = useRef<TextInput>(null);
  const verifyingRef = useRef(false);
  const setSession = useAuthStore((state) => state.setSession);

  const canVerify = code.length === OTP_LENGTH;
  const canResend = secondsLeft <= 0 && !busy;

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = useCallback(
    async (nextCode = code) => {
      if (nextCode.length !== OTP_LENGTH || busy || verifyingRef.current) {
        return;
      }

      if (isSocial) {
        verifyingRef.current = true;
        setBusy(true);
        setVerifyError(null);
        try {
          if (isEmailOtp) {
            const verified = await verifyWelmEmailOtp(email, nextCode);
            const { accessToken, refreshToken, user } = useAuthStore.getState();
            if (accessToken && user) {
              setSession(
                accessToken,
                { ...user, email: verified.email },
                refreshToken,
              );
            }
          } else {
            const verified = await verifyWelmPhoneOtp(phone, nextCode);
            const { accessToken, refreshToken, user } = useAuthStore.getState();
            if (accessToken && user) {
              setSession(
                accessToken,
                { ...user, phone: verified.phone },
                refreshToken,
              );
            }
          }
          routePastAuthGate(navigation);
        } catch (error) {
          const message = welmAuthUserMessage(error, {
            unavailable: t("common:auth.api-unavailable"),
            fallback: t("invalid-code"),
          });
          setVerifyError(message);
          reportWelmAuthFailure(error, message, t("common:error"));
          setCode("");
          inputRef.current?.focus();
        } finally {
          verifyingRef.current = false;
          setBusy(false);
        }
        return;
      }

      setSession("dev-token", {
        id: "user-1",
        name: "User",
        phone,
      });
      navigation.replace("MainTabs");
    },
    [
      busy,
      code,
      email,
      isEmailOtp,
      isSocial,
      navigation,
      phone,
      setSession,
      t,
    ],
  );

  const handleCodeChange = useCallback(
    (value: string) => {
      const next = digitsOnly(value);
      setCode(next);
      setVerifyError(null);
      if (next.length === OTP_LENGTH) {
        void handleVerify(next);
      }
    },
    [handleVerify],
  );

  const handleResend = useCallback(async () => {
    if (!canResend) {
      return;
    }
    setBusy(true);
    setVerifyError(null);
    try {
      if (isSocial) {
        if (isEmailOtp) {
          const started = await startWelmEmailOtp(email);
          if (started.debugCode) {
            setDebugCode(started.debugCode);
          }
        } else {
          await startWelmPhoneOtp(phone);
        }
      }
      setSecondsLeft(RESEND_SECONDS);
      setCode("");
      inputRef.current?.focus();
    } catch (error) {
      const message = welmAuthUserMessage(error, {
        unavailable: t("common:auth.api-unavailable"),
        fallback: t("common:error"),
      });
      reportWelmAuthFailure(error, message, t("common:error"));
    } finally {
      setBusy(false);
    }
  }, [canResend, email, isEmailOtp, isSocial, phone, t]);

  return (
    <Screen
      keyboard
      edges={["bottom"]}
      className="bg-white"
      keyboardShouldPersistTaps="always"
      header={
        <StackScreenHeader
          variant="plain"
          title={t("header")}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <View className="min-h-full">
        <View className="mt-8 items-center gap-3">
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
              fontFamily: fontFamily.semibold,
              fontSize: fontSize.label,
              lineHeight: 22,
            }}
          >
            {t("sent-to")}
          </AppText>
          <AppText
            className="text-center text-text"
            style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.body }}
          >
            {destination}
          </AppText>
          {__DEV__ && debugCode ? (
            <AppText variant="caption" className="text-center text-primary">
              {t("dev-code", { code: debugCode })}
            </AppText>
          ) : null}
        </View>

        <Pressable
          className="relative mt-10"
          onPress={() => inputRef.current?.focus()}
        >
          <View className="flex-row justify-center gap-3" pointerEvents="none">
            {Array.from({ length: OTP_LENGTH }, (_, index) => {
              const digit = code[index] ?? "";
              const isActive = index === Math.min(code.length, OTP_LENGTH - 1);
              return (
                <View
                  key={index}
                  className={`h-16 w-16 items-center justify-center rounded-2xl border bg-background ${
                    verifyError
                      ? "border-2 border-danger"
                      : isActive
                        ? "border-2 border-primary"
                        : "border-border"
                  }`}
                >
                  <AppText
                    className="text-center text-text"
                    style={{
                      fontFamily: fontFamily.bold,
                      fontSize: fontSize.xl,
                    }}
                  >
                    {digit}
                  </AppText>
                </View>
              );
            })}
          </View>
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            caretHidden
            autoFocus
            importantForAutofill="yes"
            style={styles.hiddenInput}
            accessibilityLabel={t("title")}
          />
        </Pressable>

        {verifyError ? (
          <AppText variant="caption" className="mt-4 text-center text-danger">
            {verifyError}
          </AppText>
        ) : null}

        <View className="mt-8">
          <AppButton
            label={t("verify")}
            onPress={() => {
              void handleVerify();
            }}
            loading={busy}
            disabled={!canVerify}
            variant={canVerify ? "primary" : "muted"}
          />
        </View>

        <View className="mt-auto items-center gap-1 pt-10">
          <AppText variant="body" muted>
            {t("didnt-receive")}
          </AppText>
          {canResend ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void handleResend();
              }}
              hitSlop={8}
            >
              <AppText variant="body" className="text-primary">
                {t("resend")}
              </AppText>
            </Pressable>
          ) : (
            <AppText variant="body" muted>
              {t("resend-in", { time: formatTimer(secondsLeft) })}
            </AppText>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    color: "transparent",
    opacity: 0.02,
    fontSize: 24,
  },
});
