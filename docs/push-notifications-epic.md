# Epic: Push Notifications - إشعارات التطبيق

**Parent Issue:** [#42](https://github.com/Systems-mersal/WELM-App/issues/42)

## 📋 نظرة عامة
تفعيل نظام إشعارات push notifications شامل لتطبيق ويلم، يشمل إعداد Firebase Cloud Messaging (FCM)، ربط الباكند، وتنفيذ جميع أنواع الإشعارات المطلوبة.

## 🎯 الأهداف الرئيسية
- تفعيل إشعارات push على iOS وAndroid
- ربط النظام مع Tajeer Plus backend
- إنشاء أنواع الإشعارات المختلفة (حجوزات، دفع، وثائق، عروض)
- إدارة أذونات الإشعارات وتجربة المستخدم

## 📦 Child Issues

### المرحلة 1: Setup & Infrastructure
| # | Issue | الوصف | الحالة |
|---|-------|-------|--------|
| 1 | [#43](https://github.com/Systems-mersal/WELM-App/issues/43) | إعداد Firebase Cloud Messaging (FCM) وتكوين المشروع | ⬜ Todo |
| 2 | [#44](https://github.com/Systems-mersal/WELM-App/issues/44) | إعداد Expo Notifications وأذونات الإشعارات | ⬜ Todo |
| 3 | [#45](https://github.com/Systems-mersal/WELM-App/issues/45) | ربط Backend API لإرسال واستقبال الإشعارات | ⬜ Todo |

### المرحلة 2: Notification Types Implementation
| # | Issue | الوصف | عدد الأنواع | الحالة |
|---|-------|-------|------------|--------|
| 4 | [#46](https://github.com/Systems-mersal/WELM-App/issues/46) | تنفيذ إشعارات الحجوزات | 7 أنواع | ⬜ Todo |
| 5 | [#47](https://github.com/Systems-mersal/WELM-App/issues/47) | تنفيذ إشعارات المدفوعات | 8 أنواع | ⬜ Todo |
| 6 | [#48](https://github.com/Systems-mersal/WELM-App/issues/48) | تنفيذ إشعارات الوثائق والهوية | 7 أنواع | ⬜ Todo |
| 7 | [#49](https://github.com/Systems-mersal/WELM-App/issues/49) | تنفيذ إشعارات العروض والتسويق | 8 أنواع | ⬜ Todo |

### المرحلة 3: UI/UX & Testing
| # | Issue | الوصف | الحالة |
|---|-------|-------|--------|
| 8 | [#50](https://github.com/Systems-mersal/WELM-App/issues/50) | تحسين شاشة الإشعارات (UI/UX Enhancement) | ⬜ Todo |
| 9 | [#51](https://github.com/Systems-mersal/WELM-App/issues/51) | اختبار شامل للإشعارات على iOS وAndroid | ⬜ Todo |

## 📊 الإحصائيات
- **إجمالي Child Issues:** 9
- **إجمالي أنواع الإشعارات:** 30 نوع
  - 7 إشعارات حجوزات
  - 8 إشعارات مدفوعات
  - 7 إشعارات وثائق
  - 8 إشعارات عروض/تسويق
- **المنصات المدعومة:** iOS & Android

## 📋 تفاصيل أنواع الإشعارات

### 1️⃣ إشعارات الحجوزات (Booking Notifications) - 7 أنواع
1. **Booking Confirmed** - تأكيد الحجز ✅
2. **Booking Reminder** - تذكير بالحجز (قبل 24 ساعة) 📅
3. **Ready for Pickup** - جاهزة للاستلام 🚗
4. **Booking Started** - بدأ الحجز 🔑
5. **Return Reminder** - تذكير بالإرجاع (قبل 24 ساعة) ⏰
6. **Booking Completed** - اكتمال الحجز ✨
7. **Booking Cancelled** - إلغاء الحجز ❌

### 2️⃣ إشعارات المدفوعات (Payment Notifications) - 8 أنواع
1. **Payment Received** - استلام الدفعة 💰
2. **Payment Failed** - فشل الدفع ❌
3. **Refund Processed** - استرداد مالي ↩️
4. **Payment Pending** - دفع معلق ⏳
5. **Deposit Hold** - حجز تأمين 🔒
6. **Deposit Released** - إرجاع التأمين ✅
7. **Late Fee Charged** - رسوم التأخير 💸
8. **Payment Reminder** - تذكير بالدفع 🔔

### 3️⃣ إشعارات الوثائق (Document Notifications) - 7 أنواع
1. **License Expiring Soon** - رخصة القيادة ستنتهي قريباً (30 يوم) ⚠️
2. **License Expired** - رخصة القيادة منتهية 🚫
3. **License Updated Successfully** - تحديث الرخصة بنجاح ✅
4. **License Verification Pending** - رخصة قيد المراجعة ⏳
5. **License Rejected** - رفض الرخصة ❌
6. **ID Document Expiring** - الهوية ستنتهي قريباً (60 يوم) 🪪
7. **Document Verification Required** - مطلوب تحقق من الوثائق 📄

### 4️⃣ إشعارات العروض والتسويق (Promotional Notifications) - 8 أنواع
1. **Weekend Offers** - عروض نهاية الأسبوع 🎉
2. **Flash Sale** - تخفيضات سريعة ⚡
3. **New Cars Available** - سيارات جديدة 🚗
4. **Seasonal Campaigns** - حملات موسمية 🎊
5. **Loyalty Rewards** - مكافآت الولاء 🎁
6. **Referral Bonus** - مكافأة الإحالة 👥
7. **Re-engagement** - إعادة التفاعل 🔔
8. **Personalized Recommendations** - توصيات شخصية 💡

## ✅ معايير القبول العامة
- [ ] المستخدم يستلم إشعارات push على iOS وAndroid
- [ ] الإشعارات تظهر في شاشة الإشعارات داخل التطبيق
- [ ] Navigation يعمل بشكل صحيح عند الضغط على الإشعار
- [ ] إدارة الأذونات تعمل بسلاسة
- [ ] الإشعارات مترجمة (عربي/إنجليزي)
- [ ] التطبيق يتعامل مع الإشعارات في جميع الحالات:
  - [ ] Foreground (التطبيق مفتوح)
  - [ ] Background (التطبيق في الخلفية)
  - [ ] Killed (التطبيق مغلق تماماً)
- [ ] جميع الـ 30 نوع إشعار مُنفذة ومُختبرة
- [ ] Badge count يعمل بشكل صحيح
- [ ] Notification settings تُطبّق بشكل دقيق
- [ ] Real-time updates تعمل
- [ ] Offline/online handling يعمل

## 🏗️ البنية المعمارية المقترحة

### Frontend Structure
```
src/
├── lib/
│   ├── notifications/
│   │   ├── index.ts                      # Main exports
│   │   ├── notification-permissions.ts   # Permission handling
│   │   ├── push-token.ts                 # Token management
│   │   ├── notification-handler.ts       # Global notification handler
│   │   ├── notification-storage.ts       # AsyncStorage persistence
│   │   ├── booking-notifications.ts      # Booking notification handlers
│   │   ├── payment-notifications.ts      # Payment notification handlers
│   │   ├── document-notifications.ts     # Document notification handlers
│   │   └── promotional-notifications.ts  # Promotional notification handlers
│   └── api/
│       └── notifications-api.ts          # Backend API calls
├── stores/
│   └── notification-store.ts             # Zustand store
├── types/
│   └── notifications.ts                  # TypeScript types
└── screens/
    ├── Notifications/
    │   └── NotificationsScreen.tsx       # Enhanced notifications screen
    └── Settings/
        └── NotificationSettingsScreen.tsx # Settings screen
```

### Backend Endpoints (Tajeer Plus)
```
POST   /api/welm/notifications/register-token
DELETE /api/welm/notifications/unregister-token
GET    /api/welm/notifications
PATCH  /api/welm/notifications/:id/read
PATCH  /api/welm/notifications/mark-all-read
GET    /api/welm/notifications/preferences
PATCH  /api/welm/notifications/preferences
POST   /api/internal/notifications/send  # Admin only
```

### Database Schema
```sql
-- Device Tokens
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(10) NOT NULL, -- 'ios' or 'android'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL, -- 'booking', 'payment', 'document', 'promotional'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Navigation payload
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY,
  booking_notifications BOOLEAN DEFAULT TRUE,
  payment_notifications BOOLEAN DEFAULT TRUE,
  document_notifications BOOLEAN DEFAULT TRUE,
  promotional_notifications BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 خطة التنفيذ

### Phase 1: Infrastructure Setup (الأسبوع 1)
1. **Day 1-2:** Issue #43 - Firebase Setup
2. **Day 3-4:** Issue #44 - Expo Notifications Setup
3. **Day 5-7:** Issue #45 - Backend API Integration

### Phase 2: Notification Types (الأسبوع 2-3)
يمكن العمل على هذه Issues بالتوازي (4 developers):
- **Developer 1:** Issue #46 - Booking Notifications
- **Developer 2:** Issue #47 - Payment Notifications
- **Developer 3:** Issue #48 - Document Notifications
- **Developer 4:** Issue #49 - Promotional Notifications

### Phase 3: UI/UX & Testing (الأسبوع 4)
1. **Day 1-3:** Issue #50 - UI Enhancement
2. **Day 4-7:** Issue #51 - Comprehensive Testing

**Total Estimated Duration:** 4 أسابيع

## 🔗 المراجع
- خطة ويلم: [`docs/signup-epic-follow-up.md`](./signup-epic-follow-up.md)
- الشاشة الحالية: [`src/screens/Notifications/NotificationsScreen.tsx`](../src/screens/Notifications/NotificationsScreen.tsx)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)

## 📝 ملاحظات المهمة
- ✅ حالياً الشاشة تعرض بيانات mock فقط (4 notifications hardcoded)
- ⚠️ يجب التنسيق مع فريق الباكند لإعداد endpoints المطلوبة
- ⚠️ التأكد من توافق الإشعارات مع WELM branding
- 🔴 **الترتيب مهم:** يجب إكمال Infrastructure issues (1-3) قبل Implementation issues (4-7)
- ⚡ iOS يتطلب physical device للاختبار (لا يعمل على Simulator)
- 📱 Android يعمل على Emulator و physical devices
- 🔒 **Security:** Device tokens يجب حفظها بشكل آمن
- 📊 **Analytics:** تتبع notification open rates و conversion rates
- 🌍 **i18n:** جميع النصوص يجب أن تكون في `src/i18n/*/notifications.json`

## 🎯 الخطوات التالية
1. ✅ ~~إنشاء GitHub issues (مكتمل)~~
2. ⬜ Review issues مع الفريق
3. ⬜ تعيين developers لكل issue
4. ⬜ ابدأ بـ Issue #43 (Firebase Setup)
5. ⬜ متابعة التقدم أسبوعياً

---

**آخر تحديث:** 21 أكتوبر 2026  
**المسؤول:** تطبيق ويلم - فريق المنتج  
**الحالة:** 📋 Planning
