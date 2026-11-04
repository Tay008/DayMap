import { diffDays, weekdayOf, type DateKey } from './time';
import type { PrayerName } from './prayer';

export type RoomKind = 'open' | 'sleep' | 'school' | 'travel' | 'meal' | 'worship';
export type TimeRef =
  | { t: 'clock'; min: number } // 22:30 is 1350, midnight end is 1440
  | { t: 'prayer'; p: PrayerName; off: number; plusTaraweeh?: boolean } // prayer time + off minutes
  | { t: 'college'; which: 'start' | 'end'; off: number }; // from Settings

export interface ZoneDef {
  id: string;
  name: string;
  kind: RoomKind;
  start: TimeRef;
  end: TimeRef;
}

export interface ResolvedZone extends ZoneDef {
  startMin: number;
  endMin: number;
}

export type TemplateKey = 'normal-college' | 'normal-off' | 'ramadan-college' | 'ramadan-off';

// The subset of Settings the templates need. src/data/types.ts (Step 4) defines the
// full Settings; it is structurally assignable to this interface.
export interface TemplateSettings {
  collegeStart: number;
  collegeEnd: number;
  collegeDays: number[];
  ramadanStart: DateKey | null;
  ramadanDays: number;
  taraweehMinutes: number;
}

const clock = (min: number): TimeRef => ({ t: 'clock', min });
const prayer = (p: PrayerName, off = 0, plusTaraweeh = false): TimeRef =>
  plusTaraweeh ? { t: 'prayer', p, off, plusTaraweeh } : { t: 'prayer', p, off };
const college = (which: 'start' | 'end'): TimeRef => ({ t: 'college', which, off: 0 });
const collegeOff = (which: 'start' | 'end', off: number): TimeRef => ({ t: 'college', which, off });

export const defaultTemplates: Record<TemplateKey, ZoneDef[]> = {
  'normal-college': [
    { id: 'sleep-a', name: 'Sleep', kind: 'sleep', start: clock(0), end: prayer('fajr') },
    { id: 'dawn', name: 'Dawn Room', kind: 'open', start: prayer('fajr'), end: collegeOff('start', -60) },
    { id: 'prep', name: 'Prep & Commute', kind: 'travel', start: collegeOff('start', -60), end: college('start') },
    { id: 'college', name: 'College', kind: 'school', start: college('start'), end: college('end') },
    { id: 'recovery', name: 'Recovery Room', kind: 'open', start: college('end'), end: prayer('asr') },
    { id: 'study', name: 'Study Hall', kind: 'open', start: prayer('asr'), end: prayer('maghrib') },
    { id: 'evening', name: 'Evening Room', kind: 'open', start: prayer('maghrib'), end: prayer('isha') },
    { id: 'night', name: 'Night Lab', kind: 'open', start: prayer('isha'), end: clock(1350) },
    { id: 'sleep-b', name: 'Sleep', kind: 'sleep', start: clock(1350), end: clock(1440) },
  ],
  'normal-off': [
    { id: 'sleep-a', name: 'Sleep', kind: 'sleep', start: clock(0), end: prayer('fajr') },
    { id: 'dawn', name: 'Dawn Room', kind: 'open', start: prayer('fajr'), end: prayer('sunrise', 120) },
    { id: 'morning', name: 'Morning Room', kind: 'open', start: prayer('sunrise', 120), end: prayer('dhuhr') },
    { id: 'midday', name: 'Midday Room', kind: 'open', start: prayer('dhuhr'), end: prayer('asr') },
    { id: 'study', name: 'Study Hall', kind: 'open', start: prayer('asr'), end: prayer('maghrib') },
    { id: 'evening', name: 'Evening Room', kind: 'open', start: prayer('maghrib'), end: prayer('isha') },
    { id: 'night', name: 'Night Lab', kind: 'open', start: prayer('isha'), end: clock(1350) },
    { id: 'sleep-b', name: 'Sleep', kind: 'sleep', start: clock(1350), end: clock(1440) },
  ],
  'ramadan-college': [
    { id: 'sleep-a', name: 'Sleep', kind: 'sleep', start: clock(0), end: prayer('fajr', -60) },
    { id: 'sehri', name: 'Sehri', kind: 'meal', start: prayer('fajr', -60), end: prayer('fajr') },
    { id: 'dawn', name: 'Dawn Room', kind: 'open', start: prayer('fajr'), end: collegeOff('start', -60) },
    { id: 'prep', name: 'Prep & Commute', kind: 'travel', start: collegeOff('start', -60), end: college('start') },
    { id: 'college', name: 'College', kind: 'school', start: college('start'), end: college('end') },
    { id: 'recovery', name: 'Rest Room', kind: 'open', start: college('end'), end: prayer('asr') },
    { id: 'study', name: 'Study Hall', kind: 'open', start: prayer('asr'), end: prayer('maghrib', -30) },
    { id: 'iftar', name: 'Iftar', kind: 'meal', start: prayer('maghrib', -30), end: prayer('maghrib', 30) },
    { id: 'evening', name: 'Evening Room', kind: 'open', start: prayer('maghrib', 30), end: prayer('isha') },
    { id: 'taraweeh', name: 'Isha & Taraweeh', kind: 'worship', start: prayer('isha'), end: prayer('isha', 0, true) },
    { id: 'night', name: 'Night Lab', kind: 'open', start: prayer('isha', 0, true), end: clock(1380) },
    { id: 'sleep-b', name: 'Sleep', kind: 'sleep', start: clock(1380), end: clock(1440) },
  ],
  'ramadan-off': [
    { id: 'sleep-a', name: 'Sleep', kind: 'sleep', start: clock(0), end: prayer('fajr', -60) },
    { id: 'sehri', name: 'Sehri', kind: 'meal', start: prayer('fajr', -60), end: prayer('fajr') },
    { id: 'dawn', name: 'Dawn Room', kind: 'open', start: prayer('fajr'), end: prayer('sunrise', 120) },
    { id: 'morning', name: 'Morning Room', kind: 'open', start: prayer('sunrise', 120), end: prayer('dhuhr') },
    { id: 'midday', name: 'Midday Room', kind: 'open', start: prayer('dhuhr'), end: prayer('asr') },
    { id: 'study', name: 'Study Hall', kind: 'open', start: prayer('asr'), end: prayer('maghrib', -30) },
    { id: 'iftar', name: 'Iftar', kind: 'meal', start: prayer('maghrib', -30), end: prayer('maghrib', 30) },
    { id: 'evening', name: 'Evening Room', kind: 'open', start: prayer('maghrib', 30), end: prayer('isha') },
    { id: 'taraweeh', name: 'Isha & Taraweeh', kind: 'worship', start: prayer('isha'), end: prayer('isha', 0, true) },
    { id: 'night', name: 'Night Lab', kind: 'open', start: prayer('isha', 0, true), end: clock(1380) },
    { id: 'sleep-b', name: 'Sleep', kind: 'sleep', start: clock(1380), end: clock(1440) },
  ],
};

const clamp = (n: number): number => Math.min(1440, Math.max(0, n));

function timeRefToMin(ref: TimeRef, prayerMin: Record<PrayerName, number>, settings: TemplateSettings): number {
  if (ref.t === 'clock') return ref.min;
  if (ref.t === 'college') {
    const base = ref.which === 'start' ? settings.collegeStart : settings.collegeEnd;
    return base + ref.off;
  }
  let value = prayerMin[ref.p] + ref.off;
  if (ref.plusTaraweeh) value += settings.taraweehMinutes;
  return value;
}

export function resolveTemplate(
  zones: ZoneDef[],
  prayerMin: Record<PrayerName, number>,
  settings: TemplateSettings,
): ResolvedZone[] {
  const resolved: ResolvedZone[] = zones.map((zone) => ({
    ...zone,
    startMin: clamp(timeRefToMin(zone.start, prayerMin, settings)),
    endMin: clamp(timeRefToMin(zone.end, prayerMin, settings)),
  }));

  const valid = resolved.filter((zone) => zone.endMin > zone.startMin);
  valid.sort((a, b) => a.startMin - b.startMin);

  const out: ResolvedZone[] = [];
  let previousEnd = 0;
  for (const zone of valid) {
    const startMin = Math.max(zone.startMin, previousEnd);
    if (zone.endMin <= startMin) continue; // nothing left after trimming
    out.push({ ...zone, startMin });
    previousEnd = zone.endMin;
  }
  return out;
}

export function pickTemplateKey(
  key: DateKey,
  s: TemplateSettings,
  holidays: Set<DateKey>,
  override?: TemplateKey,
): TemplateKey {
  if (override) return override;
  const since = s.ramadanStart === null ? -1 : diffDays(key, s.ramadanStart);
  const ramadan = since >= 0 && since < s.ramadanDays;
  const college = s.collegeDays.includes(weekdayOf(key)) && !holidays.has(key);
  if (ramadan) return college ? 'ramadan-college' : 'ramadan-off';
  return college ? 'normal-college' : 'normal-off';
}
