import React from "react";
import { Pressable, View } from "react-native";

import { AppIcon } from "../../../components/icons/AppIcon";
import { AppText } from "../../../components/typography/AppText";
import { colors } from "../../../theme/colors";
import { fontFamily, fontSize } from "../../../theme/typography";
import type { WelmAuthProvider } from "../api/types";

type Props = {
  provider: WelmAuthProvider;
  linkedLabel: string;
  name: string;
  subtitle: string;
  unlinkA11y: string;
  onUnlink: () => void;
};

function ProviderGlyph({ provider }: { provider: WelmAuthProvider }) {
  return (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
      <AppIcon name={provider} size={22} color={colors.text} />
    </View>
  );
}

/** Mint card: linked Apple / Google / X + identity. Same layout, chip copy/icon changes. */
export function LinkedProviderCard({
  provider,
  linkedLabel,
  name,
  subtitle,
  unlinkA11y,
  onUnlink,
}: Props) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-primaryMuted px-4 py-4">
      <ProviderGlyph provider={provider} />
      <View className="min-w-0 flex-1 items-start">
        <AppText
          className="text-primary"
          style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.caption }}
        >
          {linkedLabel}
        </AppText>
        <AppText
          className="mt-0.5 text-text"
          numberOfLines={1}
          style={{ fontFamily: fontFamily.bold, fontSize: fontSize.body }}
        >
          {name}
        </AppText>
        <AppText variant="caption" muted numberOfLines={1} className="mt-0.5">
          {subtitle}
        </AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={unlinkA11y}
        onPress={onUnlink}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center rounded-full bg-white active:opacity-70"
      >
        <AppIcon name="close" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}
