import { describe, expect, it } from 'vitest';
import { nextPrayer, prayerMinutes, prayerTimesMs } from './prayer';
import type { PrayerName } from './prayer';

const LAT = 31.5204;
const LNG = 74.3587;
const DAY = '2026-11-01';
const NO_ADJUST: Record<PrayerName, number> = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

describe('prayer', () => {
  it('orders fajr < sunrise < dhuhr < asr < maghrib < isha', () => {
    const day = prayerTimesMs(DAY, LAT, LNG, NO_ADJUST);
    expect(day.fajr).toBeLessThan(day.sunrise);
    expect(day.sunrise).toBeLessThan(day.dhuhr);
    expect(day.dhuhr).toBeLessThan(day.asr);
    expect(day.asr).toBeLessThan(day.maghrib);
    expect(day.maghrib).toBeLessThan(day.isha);
  });

  it('stays inside sane Lahore ranges (minutes of day)', () => {
    const m = prayerMinutes(prayerTimesMs(DAY, LAT, LNG, NO_ADJUST));
    expect(m.fajr).toBeGreaterThanOrEqual(240);
    expect(m.fajr).toBeLessThanOrEqual(390);
    expect(m.dhuhr).toBeGreaterThanOrEqual(660);
    expect(m.dhuhr).toBeLessThanOrEqual(780);
    expect(m.maghrib).toBeGreaterThanOrEqual(1020);
    expect(m.maghrib).toBeLessThanOrEqual(1185);
  });

  it('moves Fajr by exactly the adjustment (same under both time zones)', () => {
    const base = prayerTimesMs(DAY, LAT, LNG, NO_ADJUST);
    const adjusted = prayerTimesMs(DAY, LAT, LNG, { ...NO_ADJUST, fajr: 5 });
    expect(adjusted.fajr - base.fajr).toBe(5 * 60000);
  });

  it('nextPrayer picks the next prayer and rolls over to tomorrow Fajr', () => {
    const day = prayerTimesMs(DAY, LAT, LNG, NO_ADJUST);
    const tomorrow = prayerTimesMs('2026-11-02', LAT, LNG, NO_ADJUST);
    expect(nextPrayer(day.fajr - 60000, day, tomorrow).name).toBe('fajr');
    expect(nextPrayer(day.dhuhr - 60000, day, tomorrow).name).toBe('dhuhr');
    expect(nextPrayer(day.maghrib + 60000, day, tomorrow).name).toBe('isha');
    expect(nextPrayer(day.isha + 60000, day, tomorrow)).toEqual({
      name: 'fajr',
      time: tomorrow.fajr,
    });
  });
});
