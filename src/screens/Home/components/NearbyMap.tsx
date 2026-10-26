import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";

import { colors } from "../../../theme/colors";
import type { Vehicle } from "../../../types";

const METERS_PER_KM = 1000;
const KM_PER_LAT_DEGREE = 111;
const REGION_PADDING = 2.4;

type NearbyMapProps = {
  latitude: number;
  longitude: number;
  radiusKm: number;
  vehicles: Vehicle[];
  onVehiclePress: (vehicleId: string) => void;
};

export function NearbyMap({
  latitude,
  longitude,
  radiusKm,
  vehicles,
  onVehiclePress,
}: NearbyMapProps) {
  const { t } = useTranslation("home");
  const region = useMemo(() => {
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
  }, [latitude, longitude, radiusKm]);

  const pins = vehicles.filter(
    (vehicle) => vehicle.latitude != null && vehicle.longitude != null,
  );

  return (
    <View className="h-56 overflow-hidden rounded-2xl border border-border bg-white">
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        accessibilityLabel={t("current-location")}
      >
        <Circle
          center={{ latitude, longitude }}
          radius={radiusKm * METERS_PER_KM}
          strokeWidth={2}
          strokeColor={colors.primary}
          fillColor={`${colors.primary}22`}
        />
        <Marker
          coordinate={{ latitude, longitude }}
          title={t("current-location")}
          pinColor={colors.primary}
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
    </View>
  );
}
