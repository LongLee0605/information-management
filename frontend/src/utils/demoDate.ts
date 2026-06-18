export const APP_YEARS = [2025, 2026] as const;

export const APP_DATE_RANGE = {
  fromDate: '2025-01-01',
  toDate: '2026-12-31',
} as const;

export const DEMO_DATE_RANGE = APP_DATE_RANGE;
export const DEMO_YEAR = APP_YEARS[0];

function parseIsoDate(value: string): { year: number; month: number; day: number } | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toDayIndex(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function fromDayIndex(index: number): string {
  const date = new Date(index * 86_400_000);
  return toIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function getTodayIso(): string {
  const now = new Date();
  return toIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function isAppYearDate(value: string): boolean {
  const parsed = parseIsoDate(value);
  return parsed ? APP_YEARS.includes(parsed.year as (typeof APP_YEARS)[number]) : false;
}

export function isDemoYearDate(value: string): boolean {
  return isAppYearDate(value);
}

export function clampAppDate(value: string): string {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    return clampAppDate(getTodayIso());
  }

  const minIndex = toDayIndex(2025, 1, 1);
  const todayParts = parseIsoDate(getDemoToday());
  const maxIndex = todayParts
    ? toDayIndex(todayParts.year, todayParts.month, todayParts.day)
    : toDayIndex(2026, 12, 31);
  const index = toDayIndex(parsed.year, parsed.month, parsed.day);

  if (index < minIndex) {
    return APP_DATE_RANGE.fromDate;
  }

  if (index > maxIndex) {
    return getDemoToday();
  }

  return value;
}

export const clampDemoDate = clampAppDate;

export function clampAppDateRange(dateFrom: string, dateTo: string): {
  dateFrom: string;
  dateTo: string;
} {
  const today = getDemoToday();
  const from = clampAppDate(dateFrom);
  let to = clampAppDate(dateTo);

  if (to > today) {
    to = today;
  }

  if (from > today) {
    return { dateFrom: today, dateTo: today };
  }

  if (from <= to) {
    return { dateFrom: from, dateTo: to };
  }

  return { dateFrom: from, dateTo: from };
}

export const clampDemoDateRange = clampAppDateRange;

export function getDemoToday(): string {
  const parsed = parseIsoDate(getTodayIso());
  if (!parsed) {
    return APP_DATE_RANGE.fromDate;
  }

  const index = toDayIndex(parsed.year, parsed.month, parsed.day);
  const minIndex = toDayIndex(2025, 1, 1);
  const hardMaxIndex = toDayIndex(2026, 12, 31);

  if (index < minIndex) {
    return APP_DATE_RANGE.fromDate;
  }

  if (index > hardMaxIndex) {
    return APP_DATE_RANGE.toDate;
  }

  return toIsoDate(parsed.year, parsed.month, parsed.day);
}

export function getEffectiveAppDateRange(): {
  fromDate: typeof APP_DATE_RANGE.fromDate;
  toDate: string;
} {
  return {
    fromDate: APP_DATE_RANGE.fromDate,
    toDate: getDemoToday(),
  };
}

export function isDateOnOrBeforeToday(date: string): boolean {
  return clampAppDate(date) <= getDemoToday();
}

export function distributeAppDates(dateFrom: string, dateTo: string, count: number): string[] {
  const range = clampAppDateRange(dateFrom, dateTo);

  if (count <= 1) {
    return [range.dateFrom];
  }

  const fromParts = parseIsoDate(range.dateFrom);
  const toParts = parseIsoDate(range.dateTo);

  if (!fromParts || !toParts) {
    return [getDemoToday()];
  }

  const start = toDayIndex(fromParts.year, fromParts.month, fromParts.day);
  const end = toDayIndex(toParts.year, toParts.month, toParts.day);

  return Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1);
    const dayIndex = Math.round(start + ratio * (end - start));
    return fromDayIndex(dayIndex);
  });
}

export const distributeDemoDates = distributeAppDates;

export function formatAppDateLabel(dateString: string): string {
  const parsed = parseIsoDate(clampAppDate(dateString));
  if (!parsed) {
    return dateString;
  }

  const date = new Date(parsed.year, parsed.month - 1, parsed.day);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export const formatDemoDateLabel = formatAppDateLabel;

export function isDateInRange(date: string, fromDate: string, toDate: string): boolean {
  const today = getDemoToday();
  const normalized = clampAppDate(date);
  const from = clampAppDate(fromDate);
  let to = clampAppDate(toDate);

  if (to > today) {
    to = today;
  }

  return normalized >= from && normalized <= to;
}
