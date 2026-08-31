import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
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
  verifyWelmPhoneOtp,
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

export function OtpScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["otp", "common"]);
  const phone = route.params?.phone ?? "+966 5XX XXX XXXX";
  const intent = route.params?.intent;
  const isSocial = intent === "social";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [busy, setBusy] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const setSession = useAuthStore((state) => state.setSession);

  const code = otp.join("");
  const canVerify = code.length === OTP_LENGTH;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleVerify = useCallback(async () => {
    if (!canVerify || busy) {
      return;
    }

    if (isSocial) {
      setBusy(true);
      try {
        const verified = await verifyWelmPhoneOtp(phone, code);
        const { accessToken, refreshToken, user } = useAuthStore.getState();
        if (accessToken && user) {
          setSession(accessToken, { ...user, phone: verified.phone }, refreshToken);
        }
        routePastAuthGate(navigation);
      } catch (error) {
        const message = welmAuthUserMessage(error, {
          unavailable: t("common:auth.api-unavailable"),
          fallback: t("common:error"),
        });
        reportWelmAuthFailure(error, message, t("common:error"));
      } finally {
        setBusy(false);
      }
      return;
    }

    // Phone login / non-social signup still mocked (not US-2.6 social).
    setSession("dev-token", {
      id: "user-1",
      name: "User",
      phone,
    });
    navigation.replace("MainTabs");
  }, [busy, canVerify, code, isSocial, navigation, phone, setSession, t]);

  const handleResend = useCallback(async () => {
    if (secondsLeft > 0 || busy) {
      return;
    }
    if (isSocial) {
      try {
        await startWelmPhoneOtp(phone);
      } catch (error) {
        const message = welmAuthUserMessage(error, {
          unavailable: t("common:auth.api-unavailable"),
          fallback: t("common:error"),
        });
        reportWelmAuthFailure(error, message, t("common:error"));
        return;
      }
    }
    setSecondsLeft(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  }, [busy, isSocial, phone, secondsLeft, t]);

  const handleChange = useCallback(
    (value: string, index: number) => {
      const digit = value.replace(/\D/g, "").slice(-1);
      const next = [...otp];
      next[index] = digit;
      setOtp(next);

      if (digit && index < OTP_LENGTH - 1) {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === "Backspace" && !otp[index] && index > 0) {
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  return (
    <Screen
      keyboard
      edges={["bottom"]}
      className="bg-white"
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
            style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xxl, lineHeight: 32 }}
          >
            {t("title")}
          </AppText>
          <AppText
            className="text-center text-textMuted"
            style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.label, lineHeight: 22 }}
          >
            {t("sent-to")}
          </AppText>
          <AppText
            className="text-center text-text"
            style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.body }}
          >
            {phone}
          </AppText>
        </View>

        <View className="mt-10 flex-row justify-center gap-3">
          {otp.map((digit, index) => {
            const isActive = index === activeIndex;
            return (
              <View
                key={index}
                className={`h-16 w-16 items-center justify-center rounded-2xl border bg-background ${
                  isActive ? "border-2 border-primary" : "border-border"
                }`}
              >
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  onFocus={() => setActiveIndex(index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  className="h-full w-full text-center text-text"
                  style={{ fontFamily: fontFamily.bold, fontSize: fontSize.xl }}
                />
              </View>
            );
          })}
        </View>

        <View className="mt-6 items-center">
          {secondsLeft > 0 ? (
            <AppText variant="caption" muted>
              {t("resend-in", { time: formatTimer(secondsLeft) })}
            </AppText>
          ) : null}
        </View>

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

        <View className="mt-auto flex-row flex-wrap items-center justify-center gap-1 pt-10">
          <AppText variant="body" muted>
            {t("didnt-receive")}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void handleResend();
            }}
            disabled={secondsLeft > 0}
            hitSlop={8}
          >
            <AppText
              variant="body"
              className={secondsLeft > 0 ? "text-textMuted" : "text-primary"}
            >
              {t("resend")}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
