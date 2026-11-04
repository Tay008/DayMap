export type DateKey = string; // 'YYYY-MM-DD', Pakistan time
const OFFSET_MS = 5 * 60 * 60 * 1000;

export function dateKeyFromMs(ms: number): DateKey {
  return new Date(ms + OFFSET_MS).toISOString().slice(0, 10);
}

export function todayKey(): DateKey {
  return dateKeyFromMs(Date.now());
}

// Current time in ms. Kept here so components never call Date.now() during render.
export function nowMs(): number {
  return Date.now();
}

export function minutesOfDay(ms: number): number {
  const d = new Date(ms + OFFSET_MS);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

// The absolute ms at which a Pakistan day begins. Pure (no Date.now()).
export function dayStartMs(key: DateKey): number {
  const [y, m, d] = parts(key);
  return Date.UTC(y, m - 1, d) - OFFSET_MS;
}

// Minutes-of-day <-> the "HH:mm" a <input type="time"> wants.
export function toTimeInput(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function fromTimeInput(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (match === null) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function parts(key: DateKey): [number, number, number] {
  const [y, m, d] = key.split('-').map(Number);
  return [y, m, d];
}

export function addDays(key: DateKey, n: number): DateKey {
  const [y, m, d] = parts(key);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function diffDays(a: DateKey, b: DateKey): number {
  const t = (k: DateKey) => {
    const [y, m, d] = parts(k);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((t(a) - t(b)) / 86400000);
}

export function weekdayOf(key: DateKey): number {
  const [y, m, d] = parts(key);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const CLOCK_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Karachi',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatClock(ms: number): string {
  return CLOCK_FMT.format(new Date(ms)).replace(/\u202f/g, ' ');
}

const MINUTE_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatMinutes(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  const date = new Date(Date.UTC(2000, 0, 1, Math.floor(m / 60), m % 60));
  return MINUTE_FMT.format(date).replace(/\u202f/g, ' ');
}

// A mm:ss timer for whole seconds (the 10-minute urge timer).
export function formatTimer(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

// A countdown such as "1h 12m" or "5m". Rounds up so it never shows 0m too early.
export function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

const LONG_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatDateLong(key: DateKey): string {
  const [y, m, d] = parts(key);
  return LONG_FMT.format(new Date(Date.UTC(y, m - 1, d, 12)));
}

const MONTH_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  month: 'long',
  year: 'numeric',
});

export function formatMonth(year: number, month: number): string {
  return MONTH_FMT.format(new Date(Date.UTC(year, month - 1, 1, 12)));
}

// First and last DateKey of a calendar month.
export function monthRange(year: number, month: number): { start: DateKey; end: DateKey } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextFirst =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;
  return { start, end: addDays(nextFirst, -1) };
}

// Move a year/month pair by delta months, normalising across year boundaries.
export function shiftMonth(year: number, month: number, delta: number): [number, number] {
  const index = year * 12 + (month - 1) + delta;
  return [Math.floor(index / 12), (index % 12) + 1];
}

export function monthGrid(year: number, month: number): DateKey[][] {
  const first = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextFirst =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const daysInMonth = diffDays(nextFirst, first);
  const lead = (weekdayOf(first) + 6) % 7; // days since Monday
  const rows = Math.ceil((lead + daysInMonth) / 7);
  const weeks: DateKey[][] = [];
  let cursor = addDays(first, -lead);
  for (let w = 0; w < rows; w++) {
    const week: DateKey[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}
