import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { minutesOfDay, type DateKey } from './time';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerDay = Record<PrayerName, number>; // absolute ms

export const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function prayerTimesMs(
  key: DateKey,
  lat: number,
  lng: number,
  adjust: Record<PrayerName, number>,
): PrayerDay {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d); // adhan reads Y/M/D from this; allowed here only
  const params = CalculationMethod.Karachi(); // Univ. of Islamic Sciences, Karachi
  params.madhab = Madhab.Hanafi; // Asr
  const pt = new PrayerTimes(new Coordinates(lat, lng), date, params);
  const at = (t: Date, n: number) => t.getTime() + n * 60000;
  return {
    fajr: at(pt.fajr, adjust.fajr),
    sunrise: at(pt.sunrise, adjust.sunrise),
    dhuhr: at(pt.dhuhr, adjust.dhuhr),
    asr: at(pt.asr, adjust.asr),
    maghrib: at(pt.maghrib, adjust.maghrib),
    isha: at(pt.isha, adjust.isha),
  };
}

export function prayerMinutes(p: PrayerDay): Record<PrayerName, number> {
  return {
    fajr: minutesOfDay(p.fajr),
    sunrise: minutesOfDay(p.sunrise),
    dhuhr: minutesOfDay(p.dhuhr),
    asr: minutesOfDay(p.asr),
    maghrib: minutesOfDay(p.maghrib),
    isha: minutesOfDay(p.isha),
  };
}

export function nextPrayer(
  nowMs: number,
  day: PrayerDay,
  tomorrow?: PrayerDay,
): { name: PrayerName; time: number } {
  for (const name of PRAYER_ORDER) {
    if (day[name] > nowMs) return { name, time: day[name] };
  }
  const time = tomorrow ? tomorrow.fajr : day.fajr + 24 * 60 * 60 * 1000;
  return { name: 'fajr', time };
}
