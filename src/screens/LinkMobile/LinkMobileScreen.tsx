import React, { useCallback, useMemo, useState } from "react";
import { TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/buttons/AppButton";
import { Screen } from "../../components/common/Screen";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import {
  LinkedProviderCard,
  SignupProgress,
  discardWelmAuth,
  firstNameFromWelmUser,
  reportWelmAuthFailure,
  startWelmEmailOtp,
  welmAuthUserMessage,
} from "../../features/auth";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { colors } from "../../theme/colors";
import { fontFamily, fontSize } from "../../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "LinkMobile">;

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.includes("@") && trimmed.includes(".");
}

export function LinkMobileScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["link-mobile", "common"]);
  const provider = route.params.provider;
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState(user?.email ?? "");
  const [sending, setSending] = useState(false);

  const canSubmit = isValidEmail(email);
  const displayName =
    user?.name?.trim() ||
    firstNameFromWelmUser({
      name: user?.name ?? "",
      firstName: user?.firstName,
    }) ||
    "User";
  const cardSubtitle = email.trim();

  const linkedLabel = useMemo(() => {
    if (provider === "google") {
      return t("linked-google");
    }
    return t("linked-apple");
  }, [provider, t]);

  const handleUnlink = useCallback(async () => {
    await discardWelmAuth({ revoke: true });
    navigation.replace("CreateAccount");
  }, [navigation]);

  const handleSend = useCallback(async () => {
    const normalized = email.trim();
    if (!isValidEmail(normalized) || sending) {
      return;
    }
    setSending(true);
    try {
      const started = await startWelmEmailOtp(normalized);
      navigation.navigate("Otp", {
        email: started.email,
        intent: "social",
        provider,
        debugCode: started.debugCode,
      });
    } catch (error) {
      const message = welmAuthUserMessage(error, {
        unavailable: t("common:auth.api-unavailable"),
        fallback: t("common:error"),
      });
      reportWelmAuthFailure(error, message, t("common:error"));
    } finally {
      setSending(false);
    }
  }, [email, navigation, provider, sending, t]);

  return (
    <Screen
      keyboard
      edges={["bottom"]}
      className="bg-white"
      header={
        <StackScreenHeader
          title={t("header")}
          onBack={() => {
            void handleUnlink();
          }}
        />
      }
    >
      <View className="mt-4">
        <SignupProgress current="mobile" />
      </View>

      <View className="mt-6">
        <LinkedProviderCard
          provider={provider}
          linkedLabel={linkedLabel}
          name={displayName}
          subtitle={cardSubtitle}
          unlinkA11y={t("unlink")}
          onUnlink={() => {
            void handleUnlink();
          }}
        />
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

      <View className="mt-8">
        <AppText variant="label" className="mb-2">
          {t("email")}
        </AppText>
        <View className="h-14 justify-center rounded-2xl border border-border bg-background px-4">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t("email-placeholder")}
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            className="text-text"
            style={{
              fontFamily: fontFamily.regular,
              fontSize: fontSize.body,
              textAlign: "left",
              writingDirection: "ltr",
            }}
          />
        </View>
      </View>

      <View className="mt-6">
        <AppButton
          label={t("send-otp")}
          onPress={() => {
            void handleSend();
          }}
          loading={sending}
          variant={canSubmit ? "primary" : "muted"}
          disabled={!canSubmit}
        />
      </View>

      <AppText variant="caption" muted className="mt-4 text-center">
        {t("footer")}
      </AppText>
    </Screen>
  );
}
