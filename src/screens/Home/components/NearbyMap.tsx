import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";

import { AppIcon } from "../../../components/icons/AppIcon";
import { colors } from "../../../theme/colors";
import type { Vehicle } from "../../../types";

const METERS_PER_KM = 1000;
const KM_PER_LAT_DEGREE = 111;
const REGION_PADDING = 2.4;
const PIN_WIDTH = 28;
const PIN_HEAD = 28;
const PIN_STEM = 18;
const PIN_HEIGHT = PIN_HEAD + PIN_STEM;

type NearbyMapProps = {
  latitude: number;
  longitude: number;
  radiusKm: number;
  height: number;
  vehicles: Vehicle[];
  focusNonce: number;
  onCommit: (latitude: number, longitude: number) => void;
  onReset: () => void;
  onExpand: () => void;
  onGestureStart: () => void;
  onGestureEnd: () => void;
  onVehiclePress: (vehicleId: string) => void;
};

function regionFor(latitude: number, longitude: number, radiusKm: number) {
  const latitudeDelta = Math.max(
    (radiusKm * REGION_PADDING) / KM_PER_LAT_DEGREE,
    0.05,
  );
  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta: latitudeDelta,
  };
}

export function NearbyMap({
  latitude,
  longitude,
  radiusKm,
  height,
  vehicles,
  focusNonce,
  onCommit,
  onReset,
  onExpand,
  onGestureStart,
  onGestureEnd,
  onVehiclePress,
}: NearbyMapProps) {
  const { t } = useTranslation("home");
  const mapRef = useRef<MapView>(null);
  const skipRegion = useRef(true);
  const pointRef = useRef({ latitude, longitude, radiusKm });
  pointRef.current = { latitude, longitude, radiusKm };
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const pins = vehicles.filter(
    (vehicle) => vehicle.latitude != null && vehicle.longitude != null,
  );

  useEffect(() => {
    if (focusNonce === 0) {
      return;
    }
    const point = pointRef.current;
    skipRegion.current = true;
    mapRef.current?.animateToRegion(
      regionFor(point.latitude, point.longitude, point.radiusKm),
      350,
    );
  }, [focusNonce]);

  return (
    <View
      style={{ height }}
      className="overflow-hidden rounded-2xl border border-border bg-white"
      onLayout={(event) => {
        const { width, height: layoutHeight } = event.nativeEvent.layout;
        setMapSize((current) =>
          current.width === width && current.height === layoutHeight
            ? current
            : { width, height: layoutHeight },
        );
      }}
    >
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={regionFor(latitude, longitude, radiusKm)}
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        accessibilityLabel={t("current-location")}
        onTouchStart={onGestureStart}
        onTouchEnd={onGestureEnd}
        onTouchCancel={onGestureEnd}
        onRegionChangeComplete={(next) => {
          if (skipRegion.current) {
            skipRegion.current = false;
            return;
          }
          onCommit(next.latitude, next.longitude);
        }}
      >
        <Circle
          center={{ latitude, longitude }}
          radius={radiusKm * METERS_PER_KM}
          strokeWidth={2}
          strokeColor={colors.primary}
          fillColor={`${colors.primary}22`}
        />
        {pins.map((vehicle) => (
          <Marker
            key={vehicle.id}
            coordinate={{
              latitude: vehicle.latitude!,
              longitude: vehicle.longitude!,
            }}
            title={vehicle.displayName}
            onPress={() => onVehiclePress(vehicle.id)}
          />
        ))}
      </MapView>
      {mapSize.width > 0 && mapSize.height > 0 ? (
        <View
          pointerEvents="none"
          style={[
            styles.pin,
            {
              left: mapSize.width / 2 - PIN_WIDTH / 2,
              top: mapSize.height / 2 - PIN_HEIGHT,
            },
          ]}
        >
          <View style={styles.pinHead} />
          <View style={styles.pinStem} />
        </View>
      ) : null}
      <View className="absolute bottom-3 end-3 gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("reset-location")}
          onPress={onReset}
          className="h-11 w-11 items-center justify-center rounded-full border border-border bg-white active:opacity-70"
        >
          <AppIcon name="crosshair" size={18} color={colors.primary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("expand-map")}
          onPress={onExpand}
          className="h-11 w-11 items-center justify-center rounded-full border border-border bg-white active:opacity-70"
        >
          <AppIcon name="maximize" size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    position: "absolute",
    zIndex: 3,
    width: PIN_WIDTH,
    height: PIN_HEIGHT,
    alignItems: "center",
  },
  pinHead: {
    width: PIN_HEAD,
    height: PIN_HEAD,
    borderRadius: PIN_HEAD / 2,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.white,
  },
  pinStem: {
    width: 3,
    height: PIN_STEM,
    marginTop: -1,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
