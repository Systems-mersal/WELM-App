# WELM

Expo app for WELM luxury car rental. Talks to **Tajeer Plus HTTP APIs** only (`EXPO_PUBLIC_API_URL`). Do not add `@supabase/supabase-js` or any `EXPO_PUBLIC_SUPABASE_*` keys — Supabase stays server-side in Tajeer Plus.

## API host

| Build | `EXPO_PUBLIC_API_URL` | Tajeer Plus data |
|---|---|---|
| Local WELM → local/staging Tajeer Plus | Tajeer Plus origin, e.g. `http://localhost:3000` or your machine’s LAN IP | project `Tajeer-plus` (server-side only) |
| Store builds | `https://www.mersal.com.sa` | project `Tajeer-plus-live` (server-side only) |

Copy [`.env.example`](.env.example) to `.env` and set `EXPO_PUBLIC_API_URL`. Restart Expo after changing env.

Mobile callers authenticate with `Authorization: Bearer <accessToken>` (same pattern as Tajeer Plus `getAuthenticatedUser`). Tokens are persisted on device; refresh goes through Tajeer Plus (`POST /api/welm/auth/refresh`), never a client-side Supabase `refreshSession`.

Auth helpers live in `src/features/auth` (`completeSocialSignIn`, `exchangeSocialCredential`, `refreshWelmSession`, `logoutWelmSession`, `fetchWelmMe`). If `/api/welm/auth/*` is missing, the app surfaces a clear “API unavailable” error — it does **not** fall back to Supabase. Optional kill-switch: `EXPO_PUBLIC_WELM_AUTH_ENABLED=false`.

Enable **Sign in with Apple** (Client ID `com.welm.tajeerplus`) on the Tajeer-plus and Tajeer-plus-live Supabase dashboards. Secrets stay there / in 1Password.

OAuth return scheme: `welm://auth/callback` (`scheme: "welm"` in `app.json`). Hosted X/Google start: `{EXPO_PUBLIC_API_URL}/api/welm/auth/oauth/start?provider=x`.

Social sign-in (Apple / Google / X) requires a **native rebuild** (`pnpm ios` / `pnpm android`). It will not run in Expo Go.

## Run

```bash
pnpm install
pnpm start
```
