# WELM payments server (local Stripe PaymentIntent stub)

Minimal Express API that creates Stripe PaymentIntents for Apple Pay testing.
No database — intents are held in memory only.

## Setup

```bash
cd server
cp .env.example .env
# Edit .env and set STRIPE_SECRET_KEY=sk_test_...
npm install
npm run dev
```

Server defaults to `http://localhost:3001`.

## Env vars

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | yes | Stripe **secret** key (`sk_test_…`). Never ship this to the mobile app. |
| `PORT` | no | Defaults to `3001`. |

Get keys from [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys).

## Endpoints

### `GET /health`

Returns `{ ok: true }`.

### `POST /api/payments/create-intent`

Body:

```json
{ "amount": 10000, "currency": "sar" }
```

- `amount` — integer in the **smallest currency unit** (halalas for SAR, cents for USD)
- `currency` — ISO 4217 code

Response:

```json
{ "clientSecret": "pi_…_secret_…", "paymentIntentId": "pi_…" }
```

## Physical device testing

Apple Pay must be tested on a **physical iPhone**, not the simulator.

Point the app’s `EXPO_PUBLIC_PAYMENTS_API_URL` at your Mac’s LAN IP (e.g. `http://192.168.1.10:3001`), not `localhost`. Keep `EXPO_PUBLIC_API_URL` aimed at Tajeer Plus (e.g. `:3000`).

## Apple Pay / Stripe Dashboard (manual)

1. Create an Apple Merchant ID in the [Apple Developer portal](https://developer.apple.com/account/resources/identifiers/list/merchant).
2. In Stripe Dashboard → [Apple Pay](https://dashboard.stripe.com/settings/ios_certificates), download a CSR and create a payment processing certificate; upload it back to Stripe.
3. Enable the Apple Pay capability in Xcode (or via the Expo config plugin + `npx expo prebuild` / `npx expo run:ios`) using the same merchant ID as `EXPO_PUBLIC_APPLE_MERCHANT_ID` / `PaymentProvider`.
