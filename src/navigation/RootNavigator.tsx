import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BookingConfirmedScreen } from "../screens/BookingConfirmed/BookingConfirmedScreen";
import { BookingDatesScreen } from "../screens/BookingDates/BookingDatesScreen";
import { BookingExtrasScreen } from "../screens/BookingExtras/BookingExtrasScreen";
import { BookingReviewScreen } from "../screens/BookingReview/BookingReviewScreen";
import { CreateAccountScreen } from "../screens/CreateAccount/CreateAccountScreen";
import { DocumentsScreen } from "../screens/Documents/DocumentsScreen";
import { LegalScreen } from "../screens/Legal/LegalScreen";
import { LoginScreen } from "../screens/Login/LoginScreen";
import { NotificationsScreen } from "../screens/Notifications/NotificationsScreen";
import { OnboardingScreen } from "../screens/Onboarding/OnboardingScreen";
import { OtpScreen } from "../screens/Otp/OtpScreen";
import { SplashScreen } from "../screens/Splash/SplashScreen";
import { VehicleDetailsScreen } from "../screens/VehicleDetails/VehicleDetailsScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="Legal" component={LegalScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="BookingDates" component={BookingDatesScreen} />
      <Stack.Screen name="BookingExtras" component={BookingExtrasScreen} />
      <Stack.Screen name="BookingReview" component={BookingReviewScreen} />
      <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
    </Stack.Navigator>
  );
}
