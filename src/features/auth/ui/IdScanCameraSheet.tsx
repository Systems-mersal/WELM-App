import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "../../../components/icons/AppIcon";
import { AppText } from "../../../components/typography/AppText";
import { colors } from "../../../theme/colors";
import { fontFamily, fontSize } from "../../../theme/typography";

type Props = {
  visible: boolean;
  frameHint: string;
  statusReady: string;
  statusScanning: string;
  captureLabel: string;
  galleryLabel: string;
  cancelLabel: string;
  /** Kept for copy compatibility; sheet uses image-picker (no live ExpoCamera). */
  permissionDenied: string;
  scanning?: boolean;
  onCapture: () => void;
  onGallery: () => void;
  onCancel: () => void;
};

/**
 * Camera sheet chrome: dashed ID frame + capture / gallery / cancel.
 * Capture opens the system camera via expo-image-picker (no ExpoCamera native module).
 */
export function IdScanCameraSheet({
  visible,
  frameHint,
  statusReady,
  statusScanning,
  captureLabel,
  galleryLabel,
  cancelLabel,
  scanning = false,
  onCapture,
  onGallery,
  onCancel,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black" style={{ paddingBottom: insets.bottom }}>
        <View className="flex-1 items-center justify-center bg-text px-8">
          <View className="aspect-[1.58] w-full max-w-md rounded-2xl border-2 border-dashed border-white/85" />
          <AppText
            className="mt-4 text-center text-white"
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: fontSize.label,
            }}
          >
            {frameHint}
          </AppText>
          <AppText
            className="mt-2 text-center text-white/80"
            style={{
              fontFamily: fontFamily.regular,
              fontSize: fontSize.caption,
            }}
          >
            {scanning ? statusScanning : statusReady}
          </AppText>
        </View>

        <View
          className="gap-3 bg-white px-5 pt-5"
          style={{ paddingBottom: 16 + insets.bottom }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={captureLabel}
            disabled={scanning}
            onPress={onCapture}
            className={`h-14 flex-row items-center justify-center gap-2 rounded-pill ${
              scanning ? "bg-border" : "bg-primary active:opacity-90"
            }`}
          >
            {scanning ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <AppIcon name="camera" size={20} color={colors.white} />
                <AppText
                  className="text-white"
                  style={{
                    fontFamily: fontFamily.semibold,
                    fontSize: fontSize.body,
                  }}
                >
                  {captureLabel}
                </AppText>
              </>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={galleryLabel}
            disabled={scanning}
            onPress={onGallery}
            className="h-14 flex-row items-center justify-center gap-2 rounded-pill border border-border bg-white active:opacity-70"
          >
            <AppIcon name="image" size={20} color={colors.text} />
            <AppText
              className="text-text"
              style={{
                fontFamily: fontFamily.semibold,
                fontSize: fontSize.body,
              }}
            >
              {galleryLabel}
            </AppText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            disabled={scanning}
            onPress={onCancel}
            className="h-12 items-center justify-center active:opacity-70"
          >
            <AppText
              className="text-textMuted"
              style={{
                fontFamily: fontFamily.semibold,
                fontSize: fontSize.label,
              }}
            >
              {cancelLabel}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
