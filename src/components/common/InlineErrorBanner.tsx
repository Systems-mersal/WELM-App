import React from "react";
import { Pressable, View } from "react-native";

import { colors } from "../../theme/colors";
import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";

export interface InlineErrorBannerProps {
  message: string;
  onDismiss: () => void;
  dismissAccessibilityLabel: string;
}

export function InlineErrorBanner({
  message,
  onDismiss,
  dismissAccessibilityLabel,
}: InlineErrorBannerProps) {
  return (
    <View
      accessibilityRole="alert"
      className="mt-4 flex-row items-start gap-3 rounded-xl border border-danger bg-white px-4 py-3"
    >
      <AppText variant="caption" className="flex-1 text-start text-danger">
        {message}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dismissAccessibilityLabel}
        hitSlop={8}
        onPress={onDismiss}
        className="mt-0.5"
      >
        <AppIcon name="close" size={16} color={colors.danger} />
      </Pressable>
    </View>
  );
}
