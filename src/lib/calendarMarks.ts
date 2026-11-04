import { diffDays, type DateKey } from './time';

export type HolidayKind = 'public' | 'religious' | 'optional' | 'personal';

export interface HolidayMark {
  name: string;
  kind: HolidayKind;
  tentative: boolean;
}

export interface HijriInfo {
  day: number;
  month: number;
  monthName: string;
  year: number;
  isFirst: boolean;
}

export interface DayMarks {
  holidays: HolidayMark[];
  hijri: HijriInfo;
  ramadan: boolean;
}

export interface Upcoming {
  name: string;
  kind: HolidayKind;
  dateKey: DateKey;
  daysAway: number;
}

interface HolidayInput {
  dateKey: DateKey;
  name: string;
  kind?: HolidayKind;
  endDateKey?: DateKey;
  tentative?: boolean;
}

function isBetween(key: DateKey, start: DateKey, end: DateKey): boolean {
  return key >= start && key <= end;
}

export function hijriInfo(dateKey: DateKey, offsetDays = 0): HijriInfo {
  const base = new Date(`${dateKey}T12:00:00Z`);
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + offsetDays);
  const fmtParts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    timeZone: 'UTC',
  }).formatToParts(d);
  const get = (type: string) => {
    const part = fmtParts.find((p) => p.type === type);
    return part ? part.value : '';
  };
  const day = Number(get('day'));
  const month = Number(get('month'));
  const year = Number(get('year'));
  const monthNameFmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    timeZone: 'UTC',
    month: 'long',
  });
  const monthName = monthNameFmt.format(d);
  return { day, month, monthName, year, isFirst: day === 1 };
}

export function marksForMonth(
  monthKeys: DateKey[],
  holidays: HolidayInput[],
  hijriOffset = 0,
  ramadanSource?: boolean,
): Record<string, DayMarks> {
  const result: Record<string, DayMarks> = {};
  for (const key of monthKeys) {
    const hijri = hijriInfo(key, hijriOffset);
    result[key] = {
      holidays: [],
      hijri,
      ramadan: ramadanSource !== undefined ? ramadanSource : hijri.month === 9,
    };
  }
  for (const holiday of holidays) {
    const kind = holiday.kind ?? 'public';
    const tentative = holiday.tentative ?? kind === 'religious';
    const start = holiday.dateKey;
    const end = holiday.endDateKey ?? holiday.dateKey;
    for (const key of monthKeys) {
      if (isBetween(key, start, end)) {
        result[key].holidays.push({ name: holiday.name, kind, tentative });
      }
    }
  }
  return result;
}

export function shortDateLabel(dateKey: DateKey): string {
  const d = new Date(`${dateKey}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d);
}

export function upcoming(
  todayKey: DateKey,
  holidays: HolidayInput[],
  n: number,
): Upcoming[] {
  const items: Upcoming[] = [];
  for (const holiday of holidays) {
    const kind = holiday.kind ?? 'public';
    if (kind === 'optional') continue;
    const start = holiday.dateKey;
    if (start < todayKey) continue;
    items.push({
      name: holiday.name,
      kind,
      dateKey: start,
      daysAway: Math.max(0, diffDays(start, todayKey)),
    });
  }
  items.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    return a.name.localeCompare(b.name);
  });
  return items.slice(0, n);
}
