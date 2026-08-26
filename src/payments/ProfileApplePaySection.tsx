import React, { useCallback } from "react";
import { Alert, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppText } from "../components/typography/AppText";
import { ApplePayButton } from "./ApplePayButton";
import { SAMPLE_TOP_UP } from "./constants";
import { formatAmountFromCents } from "./money";
import { usePlatformPay } from "./usePlatformPay";

/**
 * Profile "Add Funds" block — uses the payments domain only (no Stripe imports).
 */
export function ProfileApplePaySection() {
  const { t } = useTranslation("profile");
  const { isAvailable, isCheckingAvailability, isPaying, pay } = usePlatformPay();

  const handlePay = useCallback(async () => {
    const result = await pay();

    if (result.status === "success") {
      Alert.alert(
        t("payments.success-title"),
        t("payments.success-message", {
          amount: formatAmountFromCents(SAMPLE_TOP_UP.amountCents),
          currency: SAMPLE_TOP_UP.currency.toUpperCase(),
        }),
      );
      return;
    }

    if (result.status === "canceled") {
      return;
    }

    Alert.alert(t("payments.error-title"), result.error.message);
  }, [pay, t]);

  if (isCheckingAvailability || !isAvailable) {
    return null;
  }

  return (
    <View className="mt-6 px-6">
      <AppText variant="subtitle" className="mb-1">
        {t("payments.section-title")}
      </AppText>
      <AppText variant="caption" muted className="mb-3">
        {t("payments.section-subtitle", {
          amount: formatAmountFromCents(SAMPLE_TOP_UP.amountCents),
          currency: SAMPLE_TOP_UP.currency.toUpperCase(),
        })}
      </AppText>

      <View className="rounded-[20px] bg-white p-4">
        <ApplePayButton onPress={() => void handlePay()} loading={isPaying} disabled={isPaying} />
      </View>
    </View>
  );
}
