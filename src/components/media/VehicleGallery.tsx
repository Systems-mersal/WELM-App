import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useTranslation } from "react-i18next";

import { AppIcon } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";
import { ImageViewerModal } from "./ImageViewerModal";

export interface VehicleGalleryProps {
  images: ImageSourcePropType[];
  height: number;
}

/** Swipeable photo strip with page dots; tapping a photo opens the zoomable viewer. */
export function VehicleGallery({ images, height }: VehicleGalleryProps) {
  const { t } = useTranslation("vehicle-details");
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  return (
    <View style={{ height, width: "100%", direction: "ltr" }}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, itemIndex) => String(itemIndex)}
        getItemLayout={(_, itemIndex) => ({
          length: width,
          offset: width * itemIndex,
          index: itemIndex,
        })}
        renderItem={({ item, index: itemIndex }) => (
          <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel={t("gallery.open-photo", { index: itemIndex + 1 })}
            onPress={() => {
              setIndex(itemIndex);
              setViewerOpen(true);
            }}
          >
            <Image source={item} style={{ width, height }} resizeMode="cover" />
          </Pressable>
        )}
      />

      {images.length > 1 ? (
        <>
          <View
            className="absolute inset-x-0 bottom-8 flex-row items-center justify-center gap-1.5"
            pointerEvents="none"
          >
            {images.map((_, dotIndex) => (
              <View
                key={dotIndex}
                className={
                  dotIndex === index
                    ? "h-1.5 w-[18px] rounded-full bg-white"
                    : "h-1.5 w-1.5 rounded-full bg-white/50"
                }
              />
            ))}
          </View>
          <View
            className="absolute bottom-8 right-4 flex-row items-center gap-1 rounded-pill bg-black/40 px-2.5 py-1"
            pointerEvents="none"
          >
            <AppIcon name="image" size={12} color="#FFFFFF" />
            <AppText variant="caption" className="text-xs text-white">
              {t("gallery.counter", { current: index + 1, total: images.length })}
            </AppText>
          </View>
        </>
      ) : null}

      <ImageViewerModal
        visible={viewerOpen}
        images={images}
        initialIndex={index}
        onClose={() => setViewerOpen(false)}
      />
    </View>
  );
}
