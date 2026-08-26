# WELM

Expo app for WELM luxury car rental. Talks to **Tajeer Plus HTTP APIs** only (`EXPO_PUBLIC_API_URL`). Do not add a Supabase client or `EXPO_PUBLIC_SUPABASE_*` keys.

Social sign-in (Apple / Google / X) requires a **native rebuild** (`pnpm ios` / `pnpm android`). It will not run in Expo Go. OAuth return URL: `welm://auth/callback`.
