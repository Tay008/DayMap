import { describe, expect, it } from 'vitest';
import { buildTodayView } from './todayView';
import { nextPrayer } from './prayer';
import type { PrayerDay } from './prayer';
import { formatCountdown } from './time';
import type { ResolvedZone } from './templates';

const PRAYER_MIN = { fajr: 300, sunrise: 360, dhuhr: 720, asr: 900, maghrib: 1020, isha: 1140 };
const PRAYER_MS: PrayerDay = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

function zone(id: string, name: string, startMin: number, endMin: number): ResolvedZone {
  return {
    id,
    name,
    kind: 'open',
    start: { t: 'clock', min: startMin },
    end: { t: 'clock', min: endMin },
    startMin,
    endMin,
  };
}

describe('formatCountdown', () => {
  it('rounds up to minute and formats', () => {
    expect(formatCountdown(90 * 1000)).toBe('2m');
    expect(formatCountdown(65 * 60 * 1000)).toBe('1h 5m');
    expect(formatCountdown(60 * 60 * 1000)).toBe('1h');
    expect(formatCountdown(25 * 60 * 1000)).toBe('25m');
  });
});

describe('buildTodayView helpers', () => {
  it('clamps percent', () => {
    const now = new Date('2026-11-04T15:30:00+05:00').getTime();
    const view = buildTodayView({
      now,
      dateKey: '2026-11-04',
      isToday: true,
      prayerMin: PRAYER_MIN,
      prayerMs: PRAYER_MS,
      blocks: [zone('b1', 'Study Hall', 900, 1000)],
      taskCountByRoom: { b1: 1 },
    });
    expect(view.hero?.percent).toBeGreaterThanOrEqual(0);
    expect(view.hero?.percent).toBeLessThanOrEqual(100);
    expect(view.hero?.percent).toBe(30);
  });

  it('colors room by time', () => {
    const view = buildTodayView({
      now: Date.now(),
      dateKey: '2026-11-04',
      isToday: false,
      prayerMin: PRAYER_MIN,
      prayerMs: PRAYER_MS,
      blocks: [
        zone('dawn', 'Dawn Room', 400, 500),
        zone('day', 'Study Hall', 800, 900),
        zone('eve', 'Evening Room', 1030, 1100),
        zone('nt', 'Night Lab', 1150, 1200),
      ],
      taskCountByRoom: {},
    });
    const [dawn, day, eve, nt] = view.blocks;
    expect(dawn.kind === 'room' && dawn.color).toBe('dawn');
    expect(day.kind === 'room' && day.color).toBe('day');
    expect(eve.kind === 'room' && eve.color).toBe('eve');
    expect(nt.kind === 'room' && nt.color).toBe('nt');
  });

  it('adds hijri label and urdu prayer names', () => {
    const view = buildTodayView({
      now: Date.now(),
      dateKey: '2026-11-04',
      isToday: false,
      prayerMin: PRAYER_MIN,
      prayerMs: PRAYER_MS,
      blocks: [],
      taskCountByRoom: {},
    });
    expect(view.hijriLabel.length).toBeGreaterThan(0);
    const fajr = view.prayers.find((p) => p.key === 'fajr');
    expect(fajr?.urdu).toBe('فجر');
    expect(view.nowMin).toBeNull();
  });

  it('marks next prayer after isha as tomorrow fajr', () => {
    const now = new Date('2026-11-04T23:30:00+05:00').getTime();
    const day: PrayerDay = {
      fajr: new Date('2026-11-04T04:58:00+05:00').getTime(),
      sunrise: new Date('2026-11-04T06:15:00+05:00').getTime(),
      dhuhr: new Date('2026-11-04T12:00:00+05:00').getTime(),
      asr: new Date('2026-11-04T15:30:00+05:00').getTime(),
      maghrib: new Date('2026-11-04T17:30:00+05:00').getTime(),
      isha: new Date('2026-11-04T19:30:00+05:00').getTime(),
    };
    const tomorrow: PrayerDay = {
      ...day,
      fajr: new Date('2026-11-05T04:59:00+05:00').getTime(),
    };
    const next = nextPrayer(now, day, tomorrow);
    expect(next.name).toBe('fajr');
  });
});
