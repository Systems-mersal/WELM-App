import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import { useTranslation } from "react-i18next";

import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

interface ZoomableImageProps {
  source: ImageSourcePropType;
  width: number;
  height: number;
  active: boolean;
  onZoomChange: (zoomed: boolean) => void;
}

function ZoomableImage({ source, width, height, active, onZoomChange }: ZoomableImageProps) {
  const [zoomed, setZoomed] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const reportZoom = useCallback(
    (next: boolean) => {
      setZoomed(next);
      onZoomChange(next);
    },
    [onZoomChange],
  );

  useEffect(() => {
    if (active) return;
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedX.value = 0;
    savedY.value = 0;
    setZoomed(false);
  }, [active, scale, savedScale, translateX, translateY, savedX, savedY]);

  const clampOffset = (value: number, size: number, currentScale: number) => {
    "worklet";
    const max = (size * (currentScale - 1)) / 2;
    return Math.min(Math.max(value, -max), max);
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(Math.max(savedScale.value * event.scale, 1), MAX_SCALE);
    })
    .onEnd(() => {
      if (scale.value < 1.05) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = 1;
        savedX.value = 0;
        savedY.value = 0;
        scheduleOnRN(reportZoom, false);
        return;
      }
      savedScale.value = scale.value;
      savedX.value = clampOffset(translateX.value, width, scale.value);
      savedY.value = clampOffset(translateY.value, height, scale.value);
      translateX.value = withTiming(savedX.value);
      translateY.value = withTiming(savedY.value);
      scheduleOnRN(reportZoom, true);
    });

  const pan = Gesture.Pan()
    .enabled(zoomed)
    .averageTouches(true)
    .onUpdate((event) => {
      translateX.value = clampOffset(savedX.value + event.translationX, width, scale.value);
      translateY.value = clampOffset(savedY.value + event.translationY, height, scale.value);
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = 1;
        savedX.value = 0;
        savedY.value = 0;
        scheduleOnRN(reportZoom, false);
        return;
      }
      const nextX = clampOffset((width / 2 - event.x) * (DOUBLE_TAP_SCALE - 1), width, DOUBLE_TAP_SCALE);
      const nextY = clampOffset((height / 2 - event.y) * (DOUBLE_TAP_SCALE - 1), height, DOUBLE_TAP_SCALE);
      scale.value = withTiming(DOUBLE_TAP_SCALE);
      translateX.value = withTiming(nextX);
      translateY.value = withTiming(nextY);
      savedScale.value = DOUBLE_TAP_SCALE;
      savedX.value = nextX;
      savedY.value = nextY;
      scheduleOnRN(reportZoom, true);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, doubleTap)}>
      <Animated.View style={[{ width, height }, animatedStyle]}>
        <Image source={source} style={{ width, height }} resizeMode="contain" />
      </Animated.View>
    </GestureDetector>
  );
}

export interface ImageViewerModalProps {
  visible: boolean;
  images: ImageSourcePropType[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageViewerModal({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: ImageViewerModalProps) {
  const { t } = useTranslation(["vehicle-details", "common"]);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (visible) {
      setIndex(initialIndex);
      setZoomed(false);
    }
  }, [visible, initialIndex]);

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "black", direction: "ltr" }}>
        {visible ? (
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            scrollEnabled={!zoomed}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={Math.min(initialIndex, Math.max(images.length - 1, 0))}
            getItemLayout={(_, itemIndex) => ({
              length: width,
              offset: width * itemIndex,
              index: itemIndex,
            })}
            onMomentumScrollEnd={onMomentumEnd}
            keyExtractor={(_, itemIndex) => String(itemIndex)}
            renderItem={({ item, index: itemIndex }) => (
              <View style={{ width, height, alignItems: "center", justifyContent: "center" }}>
                <ZoomableImage
                  source={item}
                  width={width}
                  height={height}
                  active={itemIndex === index}
                  onZoomChange={setZoomed}
                />
              </View>
            )}
          />
        ) : null}

        <View
          className="absolute inset-x-0 top-0 flex-row items-center justify-between px-5"
          style={{ paddingTop: insets.top + 8 }}
          pointerEvents="box-none"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("vehicle-details:gallery.close")}
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20 active:opacity-70"
          >
            <AppIcon name="close" size={20} color="#FFFFFF" />
          </Pressable>
          {images.length > 1 ? (
            <View className="rounded-pill bg-white/20 px-3 py-1">
              <AppText variant="caption" className="text-white">
                {t("vehicle-details:gallery.counter", {
                  current: index + 1,
                  total: images.length,
                })}
              </AppText>
            </View>
          ) : null}
        </View>

        <View
          className="absolute inset-x-0 items-center"
          style={{ bottom: insets.bottom + 16 }}
          pointerEvents="none"
        >
          <AppText variant="caption" className="text-white/70">
            {t("vehicle-details:gallery.zoom-hint")}
          </AppText>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
