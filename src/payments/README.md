# Apple Pay (client) — WELM

Payments domain lives in `src/payments/`. The Profile screen only imports from that barrel.

## Important constraints

- **Apple Pay does not work in Expo Go or the iOS Simulator.** Use a physical iPhone and a development build (`npx expo run:ios` or EAS).
- **Never put `sk_…` secret keys in the app.** Only `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Secret PaymentIntent creation happens in `/server` only.

## Env (project root)

Copy `.env.example` → `.env` and fill:

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_PAYMENTS_API_URL` | Local Stripe stub base URL (`http://localhost:3001` or LAN IP). Defaults to `:3001` if unset. Do not reuse `EXPO_PUBLIC_API_URL` (that is Tajeer Plus). |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `EXPO_PUBLIC_APPLE_MERCHANT_ID` | Apple Merchant ID (must match `app.json` plugin + `PaymentProvider`) |

## Native / Xcode

1. Merchant ID placeholder: `merchant.com.welm.tajeerplus` (see `app.json` plugin and `src/payments/constants.ts`).
2. After setting the real merchant ID, rebuild native iOS: `npx expo prebuild` (if needed) then `npx expo run:ios --device`.
3. In Xcode → Signing & Capabilities → Apple Pay → select the same merchant ID (the Expo config plugin usually adds this).
4. Stripe Dashboard → [iOS certificates](https://dashboard.stripe.com/settings/ios_certificates): create CSR, Apple cert, upload back to Stripe.

## Local flow

```bash
# Terminal 1 — mock backend
npm run server:dev

# Terminal 2 — app (dev client / device)
npx expo run:ios --device
```

Sample top-up amount is configured in `src/payments/constants.ts` (`SAMPLE_TOP_UP`).
