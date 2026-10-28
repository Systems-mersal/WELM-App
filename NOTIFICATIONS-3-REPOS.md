# Push notifications across the 3 repos

Status as of 26 October 2026. Two audiences:

- **WELM** (customer app) gets booking and license alerts.
- **Tajeer Plus mobile** (staff app) gets inspection alerts for the branches the phone selected.

The earlier complete-signup note is a separate file: [`COMPLETE-SIGNUP-WEB-MATCH.md`](./COMPLETE-SIGNUP-WEB-MATCH.md).

## Repos

| Repo | Remote | Branch | Where the work sits |
| --- | --- | --- | --- |
| **WELM-App** | https://github.com/Systems-mersal/WELM-App.git | `53-epic-phone-push-notifications-for-welm` | Merged to `main` in [PR #59](https://github.com/Systems-mersal/WELM-App/pull/59) (`afab71b`). Logout token drop is still local and uncommitted. |
| **Tajeer-plus** | https://github.com/Systems-mersal/Tajeer-plus.git | `notification-welm` | Two commits are on `origin/notification-welm` and are not on `main`. Cancel, language, and license-copy changes are local and uncommitted. |
| **Tajeer-plus-mobile-V2R1** | https://github.com/Systems-mersal/Tajeer-plus-mobile-V2R1.git | `Notifications` | One commit is on `origin/Notifications` and is not on `main`. Working tree is clean. |

## Finished

### WELM-App — merged (`47b281a`)

The customer app registers an Expo push token after login, shows an inbox, and opens the right screen from a tap.

- Permission is asked once, after a real session exists. A missing EAS project id skips registration.
- `POST /api/welm/push-tokens` sends the Expo token, `ios` or `android`, and `en` or `ar`.
- Switching language re-sends the same token with the new language.
- Inbox: `GET /api/welm/notifications`, mark one or all read, unread count on Home.
- A tap opens **Booking detail** or **Documents**. A tap that arrives on Splash is kept until the app is past login.
- Notifications screen, booking detail screen, and English / Arabic copy are in the app.
- `expo-notifications` is in `package.json`, with iOS notification usage text in `app.json`.

### Tajeer-plus — pushed, not merged

`33a0947d` — WELM customer pushes.

- One inbox row and one Expo push per event: approved, rejected, cancelled, payment waiting, payment recorded, vehicle ready.
- Activating a contract (`/api/contracts/[id]/activate` and activate-with-finance) sends **vehicle ready** when that contract is linked to a WELM booking.
- The same event for the same booking is not sent twice. Invalid Expo tokens are deleted.

`84657dca` — staff inspection pushes.

- A contract entering **waiting for inspection**, **holding inspection**, or **closing inspection** notifies phones that registered those branches.
- Moving deeper into the same inspection (in progress) does not send a second push.
- Copy is English or Arabic. Types are `INSPECTION_CHECKOUT`, `INSPECTION_HOLD`, `INSPECTION_CLOSE`.
- Inspectors can mark those alerts read.

### Tajeer-plus-mobile-V2R1 — pushed, not merged (`0fc8a4d`)

- The staff phone registers its Expo token together with the branches selected in the app.
- A checkout, hold, or close push opens that contract’s inspection.
- Home and the notifications list refresh when a push arrives.

## Still local — not committed

### WELM-App

Sign-out and a failed token refresh now drop the device token before the session is cleared. A failed drop does not block sign-out.

- `src/features/auth/session/apply-welm-auth.ts`
- `src/lib/api-client.ts`

### Tajeer-plus

These edits are in the working tree on `notification-welm` and are not on the remote branch.

- `POST /api/welm/push-tokens` requires `platform` (`ios` or `android`) and `language` (`en` or `ar`). `web` is no longer accepted.
- License reminders use a real sentence (“Update your driving license before {date}”) in English and Arabic. A tap target for that event is **Documents**.
- Staff can **cancel** a booking request from the request page (pending, or approved with no contract yet). The customer gets one cancel push.
- Cancelling the linked Tajeer contract marks the WELM request cancelled and sends one cancel push. Contract finance is unchanged.
- Booking and vehicle-ready notifies are awaited. A notify error is logged and does not roll back the booking or the contract.
- `apps/web/lib/__tests__/welm-notify.test.ts` and `apps/web/lib/welm/README.md` match the above.

## Needs review

Review these before merge. The merged WELM app already expects the Tajeer token and inbox routes.

1. **WELM logout change** — confirm `DELETE /api/welm/push-tokens` runs on sign-out and on a failed refresh, and that a network error still clears the local session.
2. **Tajeer uncommitted cancel path** — pending and approved-without-contract can be cancelled from the staff page. Rejected and already-cancelled requests stay blocked. Cancelling the contract updates `booking_requests` only when `welm_user_id` is set.
3. **Required language on token register** — WELM always sends `en` or `ar`. Any other client that posted a token without `language`, or with `platform: web`, will get 400.
4. **Branch scope** — an inspection push goes only to tokens that stored the contract’s branch. A phone with no branch selection should not get the alert.
5. **Dedupe** — booking events and license reminders rely on `supabase/migrations/20261023120000_welm_push_notifications.sql`. Confirm that migration is applied on the database you test.
6. **License cron is not scheduled in the repo.** There is no `vercel.json`. It has to be called the same way as vehicle-expiry reminders: `POST /api/cron/welm-license-reminders` with `x-cron-secret: $CRON_SECRET`, daily.
7. **Two apps, two token tables/usages.** WELM tokens are the customer’s. Staff tokens carry selected branches. Do not treat a WELM login as an inspector device.

## What to check

Use a physical phone. Simulators often cannot produce an Expo push token. WELM also needs a real `EXPO_PUBLIC_EAS_PROJECT_ID` (placeholder ids are ignored).

### WELM customer

1. Log in, allow notifications, and confirm one row in `device_push_tokens` with platform and language.
2. Switch the app between Arabic and English and confirm the stored language changes.
3. From Tajeer, approve a booking request. The phone gets **Approved**, the inbox shows it, Home unread count goes up, and a tap opens that booking.
4. Repeat for reject, cancel, payment waiting, payment recorded, and vehicle ready (activate the linked contract). Each event arrives once.
5. Set a WELM customer license expiry inside 30 days and run the license cron once. The push opens **Documents**. Run it again the same day and confirm there is no second reminder.
6. Sign out and confirm the token row is gone (this depends on the uncommitted WELM change). Sign in again and confirm a new token is stored.
7. Deny notification permission. The app still works, and no token is sent.

### Staff mobile + Tajeer

1. On the staff app, select a branch and confirm the registered token stores that branch.
2. Move a contract in that branch to waiting for inspection. Only phones that selected the branch get **Checkout inspection**, and a tap opens that contract.
3. Repeat for holding inspection and closing inspection.
4. Move the same contract to the in-progress status of that inspection. No second push.
5. A contract in a branch the phone did not select does not alert that phone.
6. Mark the alert read from the staff notifications list.

### Staff booking page (uncommitted Tajeer)

1. Cancel a pending WELM request. Status becomes cancelled and the customer gets one cancel push.
2. Cancel an approved request that has no contract yet. Same result.
3. Cancel the linked contract. The WELM request becomes cancelled, the customer gets one cancel push, and contract reversal still completes.
4. Cancel is not offered as a successful action on a rejected or already-cancelled request.
