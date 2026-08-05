import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { AppIcon, type AppIconName } from "../icons/AppIcon";
import { AppText } from "../typography/AppText";

type TabRouteName = "Home" | "Explore" | "Bookings" | "Favorites" | "Profile";

const TAB_CONFIG: Record<
  TabRouteName,
  { icon: AppIconName; labelKey: string }
> = {
  Home: { icon: "home", labelKey: "tabs.home" },
  Explore: { icon: "search", labelKey: "tabs.explore" },
  Bookings: { icon: "calendar", labelKey: "tabs.bookings" },
  Favorites: { icon: "heart", labelKey: "tabs.favorites" },
  Profile: { icon: "user", labelKey: "tabs.profile" },
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("common");

  return (
    <View
      className="border-t border-primaryDeep/30 bg-primaryDark"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View className="flex-row items-center justify-around px-2 pt-2">
        {state.routes.map((route, index) => {
          const routeName = route.name as TabRouteName;
          const config = TAB_CONFIG[routeName];
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              className="min-w-[56px] flex-1 items-center py-1"
            >
              <AppIcon
                name={config.icon}
                size={22}
                color={isFocused ? "#ffccaa" : "#ffffff"}
              />
              <AppText
                variant="caption"
                className={`mt-1 ${isFocused ? "text-peach" : "text-white/80"}`}
              >
                {t(config.labelKey)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
