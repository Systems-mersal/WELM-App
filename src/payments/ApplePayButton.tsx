import React from "react";
import { ActivityIndicator, View } from "react-native";
import { PlatformPay, PlatformPayButton } from "@stripe/stripe-react-native";
import { colors } from "../theme/colors";

export interface ApplePayButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Presentational Apple Pay CTA. Parent supplies onPress / loading from usePlatformPay.
 */
export function ApplePayButton({
  onPress,
  disabled = false,
  loading = false,
  className = "",
}: ApplePayButtonProps) {
  if (loading) {
    return (
      <View
        className={`h-[50px] items-center justify-center rounded-xl bg-black ${className}`}
      >
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  return (
    <PlatformPayButton
      onPress={onPress}
      disabled={disabled}
      type={PlatformPay.ButtonType.Pay}
      appearance={PlatformPay.ButtonStyle.Black}
      borderRadius={12}
      style={{ width: "100%", height: 50 }}
    />
  );
}
