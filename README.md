# WELM

Expo app for WELM luxury car rental. Talks to **Tajeer Plus HTTP APIs** only (`EXPO_PUBLIC_API_URL`). Do not add a Supabase client or `EXPO_PUBLIC_SUPABASE_*` keys.

## API host

| Build | `EXPO_PUBLIC_API_URL` |
|---|---|
| Local / staging | Tajeer Plus origin, e.g. `http://localhost:3000` or your machine’s LAN IP |
| Store | `https://www.mersal.com.sa` |

Copy [`.env.example`](.env.example) to `.env.development` (or `.env`) and set the URL. Restart Expo after changing env.

Social sign-in (Apple / Google / X) requires a **native rebuild** (`pnpm ios` / `pnpm android`). It will not run in Expo Go. OAuth return URL: `welm://auth/callback`.

## Run

```bash
pnpm install
pnpm start
```
