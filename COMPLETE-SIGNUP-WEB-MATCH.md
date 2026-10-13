# Complete signup matched to the web Add customer form

Work is local and not committed.

## Repos

| Repo | Remote | Branch | What changed |
| --- | --- | --- | --- |
| **WELM-App** | https://github.com/Systems-mersal/WELM-App.git | `math-the-web-user` | Complete signup screen, labels, and company dropdown |
| **Tajeer-plus** | https://github.com/Systems-mersal/Tajeer-plus.git | `oauth-welm` | Profile API now accepts Saudi Arabia as a GCC country |

The screen work is in **WELM-App**. The one backend change is in **Tajeer-plus**.

## What the mobile screen does now

Complete signup (`src/screens/CompleteIdentity/CompleteIdentityScreen.tsx`) follows the web **Add new customer** form.

- ID type is a dropdown: National ID, Resident ID, GCC Citizen, Visitor.
- Changing ID type shows that type’s fields and clears the previous type’s values.
- Field order and labels match the web form, in English and Arabic.
- Scan / upload ID stays at the top and can fill the form.
- **Company** is a required searchable dropdown at the top of the form.

### Fields by ID type

| ID type | Fields |
| --- | --- |
| Resident ID | Company, ID Type, Name, Mobile Number, National/Resident ID Number, Hijri Birth Date, Nationality, Address, Email |
| National ID | Same as Resident, without Nationality |
| GCC Citizen | Company, ID Type, Name, Mobile Number, Country, National/GCC ID Number, Hijri Birth Date, ID Copy Number, License Number, License Expiry Date, Place of ID Issue, Address, Email |
| Visitor | Company, ID Type, Name, Mobile Number, Nationality, Passport Number, Hijri Birth Date, ID Copy Number, License Number, License Expiry Date, Place of ID Issue, Address, Email |

Nationality starts empty for Resident and Visitor. GCC country defaults to Saudi Arabia.

## Same customers API

Complete signup does not create a staff user from the web Users screen.

It saves with `PATCH /api/welm/profile`. That writes a row in the same `customers` table the web Add customer form uses. The selected company owns the row, so the person appears in that company’s Customers list.

The company list comes from `GET /api/welm/companies` (the `companies` table).

- One company: it is selected automatically, and the dropdown still shows it.
- More than one: the user must choose before Save is enabled.
- None: the field says no companies are available, and Save stays disabled.

## Files

### WELM-App

- `src/screens/CompleteIdentity/CompleteIdentityScreen.tsx` — form layout, ID type dropdown, scan, company dropdown, save payload
- `src/i18n/en/complete-identity.json` — English labels
- `src/i18n/ar/complete-identity.json` — Arabic labels
- `src/components/forms/AppInput.tsx` — required asterisk
- `src/components/forms/SelectField.tsx` — required asterisk
- `src/components/forms/SaudiPhoneField.tsx` — required asterisk

`ios/Podfile.lock`, `ios/mersalcar.xcodeproj/project.pbxproj`, and `ios/mersalcar/PrivacyInfo.xcprivacy` also changed from `pod install` while starting the app. `pnpm-lock.yaml` is new from `pnpm i`.

### Tajeer-plus

- `apps/web/lib/welm/customer.ts` — GCC countries accepted by `PATCH /api/welm/profile` now include `SA`, so a GCC signup with Saudi Arabia as the country is saved. The set is `SA`, `AE`, `KW`, `QA`, `BH`, `OM`.
