# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## iOS 27 SDK / UIScene

Xcode 27 refuses to launch apps without the UIKit scene life cycle. [`app.json`](app.json) sets `expo-build-properties` → `ios.enableSceneSupport: true` (needs `expo` ≥ 57.0.23). React Native starts from Expo's scene delegate, not `AppDelegate`. Drop the flag on Expo SDK 58+.

- `ios/` is generated: change `app.json` and run `npx expo prebuild -p ios`, do not hand-edit native files. Signing team comes from `ios.appleTeamId`.
- `patch-package` (`postinstall`) is kept for future patches. The old `expo-modules-jsi+57.0.4` patch was removed: `expo-modules-jsi` 57.1.x includes the Date fix and its `weak let` compiles on Xcode 27. Re-test native iOS builds before bumping Expo.

## Architecture notes

Target layout (screens may still live under `src/screens/` while features grow):

- `src/features/*` — domain barrels (auth, bookings, …)
- `src/stores/` — Zustand client state (`auth-store`, `booking-draft-store`)
- `src/lib/` — `api-client` (axios → `EXPO_PUBLIC_API_URL` / Tajeer Plus), `query-client`, storage, RTL helpers
- `src/services/` — thin re-exports / future API modules

Keep axios, zustand, and React Query installed; wire them as backends land. Do not remove them as “unused.”

**API / auth:** Point the app at Tajeer Plus HTTP only. Do not add `@supabase/supabase-js` or `EXPO_PUBLIC_SUPABASE_*`. Attach `Authorization: Bearer` from `useAuthStore`; persist access + refresh in `auth-storage`; OAuth return is `welm://auth/callback`.

## Design tokens

Single source: [`src/theme/palette.json`](src/theme/palette.json) — imported by `src/theme/colors.ts` / `spacing.ts` / `radius.ts` and by `tailwind.config.js`. Prefer theme tokens and Tailwind color/radius names (`primaryMuted`, `rounded-xl`, `rounded-pill`) over raw hex / one-off sizes.

## Screen shell

Use [`Screen`](src/components/common/Screen.tsx) for page chrome (safe area, scroll, keyboard). Use [`StackScreenHeader`](src/components/layout/StackScreenHeader.tsx) for secondary stack screens. Booking flow keeps `BookingStepHeader` + sticky bar.
