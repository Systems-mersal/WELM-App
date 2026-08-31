import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../../components/buttons/AppButton";
import { Screen } from "../../components/common/Screen";
import { SaudiPhoneField } from "../../components/forms/SaudiPhoneField";
import { StackScreenHeader } from "../../components/layout/StackScreenHeader";
import { AppText } from "../../components/typography/AppText";
import {
  LinkedProviderCard,
  SignupProgress,
  discardWelmAuth,
  firstNameFromWelmUser,
  reportWelmAuthFailure,
  startWelmPhoneOtp,
  welmAuthUserMessage,
} from "../../features/auth";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { fontFamily, fontSize } from "../../theme/typography";
import {
  isValidSaudiMobile,
  normalizeSaudiMobile,
} from "../../utils/saudi-mobile";

type Props = NativeStackScreenProps<RootStackParamList, "LinkMobile">;

export function LinkMobileScreen({ navigation, route }: Props) {
  const { t } = useTranslation(["link-mobile", "common"]);
  const provider = route.params.provider;
  const user = useAuthStore((state) => state.user);
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  const canSubmit = isValidSaudiMobile(phone);
  const displayName =
    user?.name?.trim() ||
    firstNameFromWelmUser({
      name: user?.name ?? "",
      firstName: user?.firstName,
    }) ||
    "User";
  const email = user?.email ?? "";
  const handle = user?.handle?.replace(/^@/, "");
  const cardSubtitle =
    provider === "x" && handle ? `@${handle}` : email;

  const linkedLabel = useMemo(() => {
    if (provider === "google") {
      return t("linked-google");
    }
    if (provider === "x") {
      return t("linked-x");
    }
    return t("linked-apple");
  }, [provider, t]);

  const handleUnlink = useCallback(async () => {
    await discardWelmAuth({ revoke: true });
    navigation.replace("CreateAccount");
  }, [navigation]);

  const handleSend = useCallback(async () => {
    const normalized = normalizeSaudiMobile(phone);
    if (!isValidSaudiMobile(normalized) || sending) {
      return;
    }
    const e164 = `+966${normalized}`;
    setSending(true);
    try {
      const started = await startWelmPhoneOtp(e164);
      navigation.navigate("Otp", {
        phone: started.phone,
        intent: "social",
        provider,
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
  }, [navigation, phone, provider, sending, t]);

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
        <SaudiPhoneField
          value={phone}
          onChangeText={setPhone}
          placeholder={t("phone-placeholder")}
        />
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
