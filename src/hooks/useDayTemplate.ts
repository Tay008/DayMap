import { useMemo } from 'react';
import { defaultTemplates, pickTemplateKey, resolveTemplate } from '../lib/templates';
import type { ResolvedZone, TemplateKey } from '../lib/templates';
import { prayerMinutes, prayerTimesMs } from '../lib/prayer';
import type { PrayerDay, PrayerName } from '../lib/prayer';
import { diffDays, type DateKey } from '../lib/time';
import { useSettings } from './useSettings';
import { useHolidays } from './useHolidays';
import { useDayOverrides } from './useDayOverrides';

export interface DayTemplate {
  templateKey: TemplateKey;
  override: TemplateKey | null;
  ramadan: boolean;
  rooms: ResolvedZone[];
  prayers: PrayerDay;
  prayerMin: Record<PrayerName, number>;
}

// Places a date on a template: picks it from settings/holidays/override, computes the
// prayers and resolves the rooms. Shared by useDay and the Task form's Room field.
export function useDayTemplate(uid: string | null, dateKey: DateKey | null): DayTemplate | null {
  const settings = useSettings(uid);
  const holidays = useHolidays(uid);
  const overrides = useDayOverrides(uid);

  const holidaySet = useMemo(() => new Set(holidays.map((holiday) => holiday.dateKey)), [holidays]);

  if (!dateKey || !settings) return null;

  const match = overrides.find((entry) => entry.dateKey === dateKey);
  const override = match ? match.templateKey : null;
  const templateKey = pickTemplateKey(dateKey, settings, holidaySet, override ?? undefined);
  const prayers = prayerTimesMs(dateKey, settings.lat, settings.lng, settings.adjust);
  const prayerMin = prayerMinutes(prayers);
  const rooms = resolveTemplate(defaultTemplates[templateKey], prayerMin, settings);

  const since = settings.ramadanStart === null ? -1 : diffDays(dateKey, settings.ramadanStart);
  const ramadan = since >= 0 && since < settings.ramadanDays;

  return { templateKey, override, ramadan, rooms, prayers, prayerMin };
}
