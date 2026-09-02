import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp, NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Bookings: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Otp:
    | {
        phone?: string;
        email?: string;
        intent?: "signup" | "social";
        provider?: "apple" | "google";
        /** Present only when Tajeer is not production and SMTP is not wired. */
        debugCode?: string;
      }
    | undefined;
  CreateAccount: undefined;
  LinkMobile: { provider: "apple" | "google" };
  AccountExists: undefined;
  ProfileGate: undefined;
  Legal: { kind: "terms" | "privacy" };
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  VehicleDetails: { vehicleId: string };
  BookingDates: { vehicleId: string };
  BookingExtras: { vehicleId: string };
  BookingReview: { vehicleId: string };
  BookingConfirmed: { vehicleId?: string };
  Notifications: undefined;
  Documents: undefined;
  LocationRadius: undefined;
};

export type MainTabNavigationProp<T extends keyof MainTabParamList> =
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, T>,
    NativeStackNavigationProp<RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
