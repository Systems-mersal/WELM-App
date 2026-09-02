# متابعة Epic التسجيل — WELM

آخر تحديث: 2 سبتمبر 2026

خط **الموقع + الهوم + الاستكشاف (US-13 … US-19)** خلص على الموبايل بالموك. الملف ده يوضح **اللي اتعمل** و**اللي فاضل**.

لوحة الحالة الحيّة: [`signup-epic-status.html`](./signup-epic-status.html)

---

## خلص (موبايل)

| US | الموضوع | ملخص |
|---|---|---|
| US-6 | فشل السوشيال | بانر أحمر على Create Account؛ إلغاء صامت |
| US-9 / US-12 | البروفايل + هجري | ProfileGate: هوية، ميلاد هجري (`@internationalized/date`)، رخصة، جنسية — حفظ محلي |
| US-13 | تفعيل الموقع | كارت على Home + When In Use + lat/lng محلي |
| US-14 | خريطة + نطاق | `LocationRadius` + Apple Maps + 10/25/50 كم |
| US-15 | مدينة يدوي | اختيار مدينة بعد Later/رفض GPS |
| US-16 | فلتر الهوم | `filterVehiclesInRadius` (Haversine) |
| US-17 | Explore قائمة/خريطة | نفس الفلتر + ماركرز |
| US-18 | فاضي / خارج التغطية | empty + أقرب مدينة + CTA |
| US-19 | تغيير الموقع من الهوم | شريحة في `HomeHeader` |

**معمارية الموقع (مصدر واحد):**

```text
Search Point (GPS أو City) + radiusKm
        ↓
filterVehiclesInRadius()
        ↓
useFilteredVehicles()
        ↓
Home / Explore (list | map | empty)
```

تخزين الجهاز: مفتاح واحد `welm.deviceLocation.v1` (`latitude` / `longitude` / `radiusKm` / `cityKey` اختياري).

---

## فاضل — يحتاج باكند / قرار منتج

لا تكمّل دول من الموبايل لوحده من غير عقد Tajeer.

### 1. US-10 — PATCH بروفايل WELM
- البروفايل دلوقتي **محلي فقط** (`auth-storage`).
- مطلوب: `PATCH /api/welm/profile` (أو ما يعادله) + ربط `profiles` ↔ customers.
- مرجع ويب موظفين: CustomerDetailsStep في Tajeer Plus.

### 2. US-11 — مسح الهوية (كاميرا / OCR)
- على الموبايل: صفر (`expo-camera` مش متثبت).
- موجود موظفين: `POST /api/customers/scan-id` — مش مسار WELM consumer.

### 3. فون OTP حقيقي
- مسار الجوال بعد Create Account لسه **mock** (`dev-token` → MainTabs).
- مطلوب: `startWelmPhoneOtp` / verify عبر `/api/welm/auth/phone/*` + SMS.

### 4. Google Sign-In كامل
- الكود موجود (`google-auth.ts` + زرار).
- مطلوب: تأكيد `EXPO_PUBLIC_GOOGLE_*` + إعداد Google في Supabase / Tajeer OAuth.
- Apple شغال native؛ X اتشال بقرار منتج.

### 5. عربيات / فروع حقيقية بدل الموك
- الفلتر شغال على `MOCK_VEHICLES` بإحداثيات مراكز المدن.
- مطلوب لاحقاً: API عربيات بإحداثيات فروع/CRM؛ استبدال الموك من غير تغيير UI الفلتر.

---

## فاضل — تجميل / قرارات (موبايل)

| بند | ملاحظة |
|---|---|
| Create Account copy | نصوص/placeholders مش Exact Figma |
| Explore فلاتر rating/price/type | UI موجود؛ السلوك لسه شكلي (`alertComingSoon` جزئياً) |
| Stripe على iOS | TurboModule `StripeSdk` ممكن يفشل وقت الإقلاع — منفصل عن موقع/هوم |
| US-20 قرارات تصميم | تثبيت الرخصة vs نطاق الاستلام ≠ نقطة الاستلام في الحجز |
| SMTP إيميل | تأكيد الإيميل بعد السوشيال يعتمد `debugCode` في غير production |

---

## ترتيب مقترح للجاية

1. **عقد بروفايل (US-10)** لو هتقفل الـ signup end-to-end مع السيرفر.
2. **عربيات API** لو هتستبدل الموك على الهوم/الاستكشاف.
3. **Google env** أو **فون OTP** حسب أولوية المنتج.
4. **كاميرا/OCR (US-11)** بعد ما يبقى فيه مسار WELM واضح.

---

## تحقق يدوي سريع (موقع)

1. امسح التطبيق أو مفتاح `welm.deviceLocation.v1` عشان تشوف كارت Enable.
2. GPS → نطاق → هوم متفلتر.
3. Later / Deny → اختيار مدينة → نطاق → هوم.
4. شريحة الموقع في الهيدر: مدينة / GPS / نطاق.
5. Explore: List و Map لنفس العربيات؛ empty لو النطاق فاضي.

---

## ملفات أساسية

- `src/stores/location-store.ts` · `src/lib/location-storage.ts` · `src/lib/vehicle-radius.ts`
- `src/hooks/useFilteredVehicles.ts` · `src/constants/search-cities.ts`
- `src/screens/LocationRadius/LocationRadiusScreen.tsx`
- `src/screens/Home/HomeScreen.tsx` · `src/screens/Explore/ExploreScreen.tsx`
- `docs/signup-epic-status.html`
