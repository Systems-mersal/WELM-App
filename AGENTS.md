# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## `expo-modules-jsi` patch

This repo applies [`patches/expo-modules-jsi+57.0.4.patch`](patches/expo-modules-jsi+57.0.4.patch) via `patch-package` (`postinstall`).

- **Why:** Swift concurrency / Date coding fixes needed for the current Expo 57 + RN 0.86 iOS build.
- **Hoist:** [`.npmrc`](.npmrc) uses `node-linker=hoisted` and `public-hoist-pattern[]=expo-modules-jsi` so the patch target resolves.
- **When upgrading Expo:** re-test native iOS builds; refresh or remove the patch once upstream includes the fix. Do not bump Expo blindly without verifying this patch still applies.

## Architecture notes

Target layout (screens may still live under `src/screens/` while features grow):

- `src/features/*` — domain barrels (auth, bookings, …)
- `src/stores/` — Zustand client state (`auth-store`, `booking-draft-store`)
- `src/lib/` — `api-client` (axios), `query-client`, storage, RTL helpers
- `src/services/` — thin re-exports / future API modules

Keep axios, zustand, and React Query installed; wire them as backends land. Do not remove them as “unused.”

## Design tokens

Single source: [`src/theme/palette.json`](src/theme/palette.json) — imported by `src/theme/colors.ts` / `spacing.ts` / `radius.ts` and by `tailwind.config.js`. Prefer theme tokens and Tailwind color/radius names (`primaryMuted`, `rounded-xl`, `rounded-pill`) over raw hex / one-off sizes.

## Screen shell

Use [`Screen`](src/components/common/Screen.tsx) for page chrome (safe area, scroll, keyboard). Use [`StackScreenHeader`](src/components/layout/StackScreenHeader.tsx) for secondary stack screens. Booking flow keeps `BookingStepHeader` + sticky bar.
