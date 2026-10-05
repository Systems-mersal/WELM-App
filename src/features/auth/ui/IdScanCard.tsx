import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { AppIcon } from "../../../components/icons/AppIcon";
import { AppText } from "../../../components/typography/AppText";
import { colors } from "../../../theme/colors";
import { fontFamily, fontSize } from "../../../theme/typography";

type Props = {
  title: string;
  description: string;
  cameraLabel: string;
  uploadLabel: string;
  scanning?: boolean;
  disabled?: boolean;
  onCamera: () => void;
  onUpload: () => void;
};

/** Mint scan CTA — camera + gallery entry points for ID / Iqama. */
export function IdScanCard({
  title,
  description,
  cameraLabel,
  uploadLabel,
  scanning = false,
  disabled = false,
  onCamera,
  onUpload,
}: Props) {
  const inactive = scanning || disabled;

  return (
    <View className="rounded-2xl border border-border bg-primaryMuted px-4 py-4">
      <AppText
        className="text-start text-text"
        style={{ fontFamily: fontFamily.bold, fontSize: fontSize.body }}
      >
        {title}
      </AppText>
      <AppText
        className="mt-1 text-start text-textMuted"
        style={{ fontFamily: fontFamily.regular, fontSize: fontSize.caption, lineHeight: 20 }}
      >
        {description}
      </AppText>

      <View className="mt-4 flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cameraLabel}
          accessibilityState={{ disabled: inactive }}
          disabled={inactive}
          onPress={onCamera}
          className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-pill ${
            inactive ? "bg-primary/40" : "bg-primary active:opacity-90"
          }`}
        >
          {scanning ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <AppIcon name="camera" size={18} color={colors.white} />
              <AppText
                className="text-white"
                style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.caption }}
              >
                {cameraLabel}
              </AppText>
            </>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={uploadLabel}
          accessibilityState={{ disabled: inactive }}
          disabled={inactive}
          onPress={onUpload}
          className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-pill border border-border bg-white ${
            inactive ? "opacity-40" : "active:opacity-70"
          }`}
        >
          <AppIcon name="image" size={18} color={colors.text} />
          <AppText
            className="text-text"
            style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.caption }}
          >
            {uploadLabel}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
