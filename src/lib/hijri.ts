import {
  CalendarDate,
  GregorianCalendar,
  IslamicUmalquraCalendar,
  getLocalTimeZone,
  parseDate,
  toCalendar,
  today,
  type Calendar,
} from "@internationalized/date";

export type HijriYmd = {
  year: number;
  month: number;
  day: number;
};

/**
 * Isolated so the product can swap calendars later
 * (`IslamicCivilCalendar`, `IslamicTabularCalendar`, …)
 * without touching ProfileGate.
 *
 * `IslamicUmalquraCalendar` is the Saudi Umm al-Qura variant
 * (`islamic-umalqura`). Tables cover AH 1300–1600; outside that
 * the library falls back to civil Islamic arithmetic.
 */
export function createHijriCalendar(): Calendar {
  return new IslamicUmalquraCalendar();
}

function gregorianCalendar(): Calendar {
  return new GregorianCalendar();
}

function localTimeZone(): string {
  try {
    return getLocalTimeZone();
  } catch {
    return "UTC";
  }
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function toYmd(date: CalendarDate): HijriYmd {
  return { year: date.year, month: date.month, day: date.day };
}

export function toHijriDate(value: HijriYmd): CalendarDate {
  return new CalendarDate(
    createHijriCalendar(),
    value.year,
    value.month,
    value.day,
  );
}

/** Constrains day/month against the active Hijri calendar. */
export function constrainHijri(value: HijriYmd): HijriYmd {
  return toYmd(toHijriDate(value));
}

export function setHijriPart(
  current: HijriYmd,
  part: keyof HijriYmd,
  next: number,
): HijriYmd {
  return constrainHijri({ ...current, [part]: next });
}

export function hijriMonthLength(year: number, month: number): number {
  const date = toHijriDate({ year, month, day: 1 });
  return date.calendar.getDaysInMonth(date);
}

export function todayHijri(): HijriYmd {
  return toYmd(toCalendar(today(localTimeZone()), createHijriCalendar()));
}

export function defaultHijriDraft(): HijriYmd {
  const current = todayHijri();
  return constrainHijri({ year: current.year - 25, month: 1, day: 1 });
}

export function formatHijriIso(value: HijriYmd): string {
  const date = constrainHijri(value);
  return `${date.year}-${pad2(date.month)}-${pad2(date.day)}`;
}

export function hijriToGregorianIso(value: HijriYmd): string {
  return toCalendar(toHijriDate(value), gregorianCalendar()).toString();
}

export function parseGregorianIso(value: string): CalendarDate | null {
  try {
    return parseDate(value.trim());
  } catch {
    return null;
  }
}

export function parseHijriIso(value: string): HijriYmd | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 30) {
    return null;
  }
  const constrained = constrainHijri({ year, month, day });
  if (
    constrained.year !== year ||
    constrained.month !== month ||
    constrained.day !== day
  ) {
    return null;
  }
  return constrained;
}

export function hijriFromStored(
  hijriIso?: string,
  gregorianIso?: string,
): HijriYmd | null {
  const fromHijri = hijriIso ? parseHijriIso(hijriIso) : null;
  if (fromHijri) {
    return fromHijri;
  }
  if (!gregorianIso) {
    return null;
  }
  const gregorian = parseGregorianIso(gregorianIso);
  if (!gregorian) {
    return null;
  }
  return toYmd(toCalendar(gregorian, createHijriCalendar()));
}

export function hijriYearRange(includeYear?: number): number[] {
  const current = todayHijri().year;
  const max = current - 15;
  const min = current - 90;
  const top = includeYear != null ? Math.max(max, includeYear) : max;
  const bottom = includeYear != null ? Math.min(min, includeYear) : min;
  const years: number[] = [];
  for (let year = top; year >= bottom; year -= 1) {
    years.push(year);
  }
  return years;
}
