import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";

import { defaultLocale, isAppLocale, type AppLocale } from "./routing";
import arCommon from "./ar/common.json";
import arSplash from "./ar/splash.json";
import arOnboarding from "./ar/onboarding.json";
import arLogin from "./ar/login.json";
import arCreateAccount from "./ar/create-account.json";
import arLegal from "./ar/legal.json";
import arOtp from "./ar/otp.json";
import arHome from "./ar/home.json";
import arExplore from "./ar/explore.json";
import arBookings from "./ar/bookings.json";
import arFavorites from "./ar/favorites.json";
import arProfile from "./ar/profile.json";
import arVehicleDetails from "./ar/vehicle-details.json";
import arBookingDates from "./ar/booking-dates.json";
import arBookingExtras from "./ar/booking-extras.json";
import arBookingReview from "./ar/booking-review.json";
import arBookingConfirmed from "./ar/booking-confirmed.json";
import arNotifications from "./ar/notifications.json";
import arDocuments from "./ar/documents.json";
import arVehicles from "./ar/vehicles.json";

import enCommon from "./en/common.json";
import enSplash from "./en/splash.json";
import enOnboarding from "./en/onboarding.json";
import enLogin from "./en/login.json";
import enCreateAccount from "./en/create-account.json";
import enLegal from "./en/legal.json";
import enOtp from "./en/otp.json";
import enHome from "./en/home.json";
import enExplore from "./en/explore.json";
import enBookings from "./en/bookings.json";
import enFavorites from "./en/favorites.json";
import enProfile from "./en/profile.json";
import enVehicleDetails from "./en/vehicle-details.json";
import enBookingDates from "./en/booking-dates.json";
import enBookingExtras from "./en/booking-extras.json";
import enBookingReview from "./en/booking-review.json";
import enBookingConfirmed from "./en/booking-confirmed.json";
import enNotifications from "./en/notifications.json";
import enDocuments from "./en/documents.json";
import enVehicles from "./en/vehicles.json";

export const namespaces = [
  "common",
  "splash",
  "onboarding",
  "login",
  "create-account",
  "legal",
  "otp",
  "home",
  "explore",
  "bookings",
  "favorites",
  "profile",
  "vehicle-details",
  "booking-dates",
  "booking-extras",
  "booking-review",
  "booking-confirmed",
  "notifications",
  "documents",
  "vehicles",
] as const;

export type AppNamespace = (typeof namespaces)[number];

const deviceLanguageCode = getLocales()[0]?.languageCode;
export const defaultLanguage: AppLocale = isAppLocale(deviceLanguageCode)
  ? deviceLanguageCode
  : defaultLocale;

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: defaultLanguage,
  fallbackLng: defaultLocale,
  defaultNS: "common",
  ns: [...namespaces],
  resources: {
    ar: {
      common: arCommon,
      splash: arSplash,
      onboarding: arOnboarding,
      login: arLogin,
      "create-account": arCreateAccount,
      legal: arLegal,
      otp: arOtp,
      home: arHome,
      explore: arExplore,
      bookings: arBookings,
      favorites: arFavorites,
      profile: arProfile,
      "vehicle-details": arVehicleDetails,
      "booking-dates": arBookingDates,
      "booking-extras": arBookingExtras,
      "booking-review": arBookingReview,
      "booking-confirmed": arBookingConfirmed,
      notifications: arNotifications,
      documents: arDocuments,
      vehicles: arVehicles,
    },
    en: {
      common: enCommon,
      splash: enSplash,
      onboarding: enOnboarding,
      login: enLogin,
      "create-account": enCreateAccount,
      legal: enLegal,
      otp: enOtp,
      home: enHome,
      explore: enExplore,
      bookings: enBookings,
      favorites: enFavorites,
      profile: enProfile,
      "vehicle-details": enVehicleDetails,
      "booking-dates": enBookingDates,
      "booking-extras": enBookingExtras,
      "booking-review": enBookingReview,
      "booking-confirmed": enBookingConfirmed,
      notifications: enNotifications,
      documents: enDocuments,
      vehicles: enVehicles,
    },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
