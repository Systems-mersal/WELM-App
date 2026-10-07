export type LookupItem = {
  code: string;
  en: string;
  ar: string;
};

/** Tajeer gccNationality fallback — GCC only, including SA. */
export const GCC_COUNTRIES: readonly LookupItem[] = [
  { code: "SA", en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
  { code: "AE", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
  { code: "KW", en: "Kuwait", ar: "الكويت" },
  { code: "QA", en: "Qatar", ar: "قطر" },
  { code: "BH", en: "Bahrain", ar: "البحرين" },
  { code: "OM", en: "Oman", ar: "عُمان" },
];

/** Static Yakeen-style nationality list (Tajeer `yakeen-nationality` fallback). */
export const YAKEEN_NATIONALITIES: readonly LookupItem[] = [
  { code: "SA", en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
  { code: "AE", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
  { code: "KW", en: "Kuwait", ar: "الكويت" },
  { code: "QA", en: "Qatar", ar: "قطر" },
  { code: "BH", en: "Bahrain", ar: "البحرين" },
  { code: "OM", en: "Oman", ar: "عُمان" },
  { code: "EG", en: "Egypt", ar: "مصر" },
  { code: "JO", en: "Jordan", ar: "الأردن" },
  { code: "YE", en: "Yemen", ar: "اليمن" },
  { code: "SD", en: "Sudan", ar: "السودان" },
  { code: "PS", en: "Palestine", ar: "فلسطين" },
  { code: "LB", en: "Lebanon", ar: "لبنان" },
  { code: "SY", en: "Syria", ar: "سوريا" },
  { code: "IQ", en: "Iraq", ar: "العراق" },
  { code: "MA", en: "Morocco", ar: "المغرب" },
  { code: "TN", en: "Tunisia", ar: "تونس" },
  { code: "DZ", en: "Algeria", ar: "الجزائر" },
  { code: "LY", en: "Libya", ar: "ليبيا" },
  { code: "TR", en: "Turkey", ar: "تركيا" },
  { code: "PK", en: "Pakistan", ar: "باكستان" },
  { code: "IN", en: "India", ar: "الهند" },
  { code: "ID", en: "Indonesia", ar: "إندونيسيا" },
  { code: "PH", en: "Philippines", ar: "الفلبين" },
  { code: "BD", en: "Bangladesh", ar: "بنغلاديش" },
  { code: "GB", en: "United Kingdom", ar: "المملكة المتحدة" },
  { code: "US", en: "United States", ar: "الولايات المتحدة" },
  { code: "FR", en: "France", ar: "فرنسا" },
  { code: "DE", en: "Germany", ar: "ألمانيا" },
  { code: "CN", en: "China", ar: "الصين" },
  { code: "ET", en: "Ethiopia", ar: "إثيوبيا" },
  { code: "ER", en: "Eritrea", ar: "إريتريا" },
  { code: "SO", en: "Somalia", ar: "الصومال" },
  { code: "NP", en: "Nepal", ar: "نيبال" },
  { code: "LK", en: "Sri Lanka", ar: "سريلانكا" },
  { code: "KE", en: "Kenya", ar: "كينيا" },
  { code: "NG", en: "Nigeria", ar: "نيجيريا" },
  { code: "IT", en: "Italy", ar: "إيطاليا" },
  { code: "ES", en: "Spain", ar: "إسبانيا" },
  { code: "CA", en: "Canada", ar: "كندا" },
  { code: "AU", en: "Australia", ar: "أستراليا" },
];

/** Tajeer `yakeen-city` fallback — Saudi places of ID issue. */
export const YAKEEN_CITIES: readonly LookupItem[] = [
  { code: "riyadh", en: "Riyadh", ar: "الرياض" },
  { code: "jeddah", en: "Jeddah", ar: "جدة" },
  { code: "makkah", en: "Makkah", ar: "مكة المكرمة" },
  { code: "madinah", en: "Madinah", ar: "المدينة المنورة" },
  { code: "dammam", en: "Dammam", ar: "الدمام" },
  { code: "khobar", en: "Khobar", ar: "الخبر" },
  { code: "dhahran", en: "Dhahran", ar: "الظهران" },
  { code: "taif", en: "Taif", ar: "الطائف" },
  { code: "abha", en: "Abha", ar: "أبها" },
  { code: "khamis-mushait", en: "Khamis Mushait", ar: "خميس مشيط" },
  { code: "tabuk", en: "Tabuk", ar: "تبوك" },
  { code: "hail", en: "Hail", ar: "حائل" },
  { code: "jazan", en: "Jazan", ar: "جازان" },
  { code: "najran", en: "Najran", ar: "نجران" },
  { code: "buraidah", en: "Buraidah", ar: "بريدة" },
  { code: "unaizah", en: "Unaizah", ar: "عنيزة" },
  { code: "jubail", en: "Jubail", ar: "الجبيل" },
  { code: "yanbu", en: "Yanbu", ar: "ينبع" },
  { code: "ahsa", en: "Al Ahsa", ar: "الأحساء" },
  { code: "sakaka", en: "Sakaka", ar: "سكاكا" },
];

export const GCC_COUNTRY_CODES = GCC_COUNTRIES.map((item) => item.code);

export function lookupLabel(
  items: readonly LookupItem[],
  code: string,
  language: string,
): string | undefined {
  const item = items.find((entry) => entry.code === code);
  if (!item) {
    return undefined;
  }
  return language.startsWith("ar") ? item.ar : item.en;
}

export function lookupOptions(
  items: readonly LookupItem[],
  language: string,
): { value: string; label: string }[] {
  return items.map((item) => ({
    value: item.code,
    label: language.startsWith("ar") ? item.ar : item.en,
  }));
}
