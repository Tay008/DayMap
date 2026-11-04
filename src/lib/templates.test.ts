import { describe, expect, it } from 'vitest';
import type { PrayerName } from './prayer';
import { defaultTemplates, pickTemplateKey, resolveTemplate } from './templates';
import type { TemplateSettings, ZoneDef } from './templates';

const SETTINGS: TemplateSettings = {
  collegeStart: 480,
  collegeEnd: 840,
  collegeDays: [1, 2, 3, 4, 5],
  ramadanStart: null,
  ramadanDays: 30,
  taraweehMinutes: 90,
};

const RAMADAN: TemplateSettings = { ...SETTINGS, ramadanStart: '2027-02-06' };

const NO_HOLIDAYS = new Set<string>();

const PRAYERS: Record<PrayerName, number> = {
  fajr: 300,
  sunrise: 380,
  dhuhr: 710,
  asr: 900,
  maghrib: 1035,
  isha: 1140,
};

describe('pickTemplateKey', () => {
  it('Tuesday outside Ramadan is normal-college', () => {
    expect(pickTemplateKey('2026-11-03', SETTINGS, NO_HOLIDAYS)).toBe('normal-college');
  });

  it('Saturday outside Ramadan is normal-off', () => {
    expect(pickTemplateKey('2026-11-07', SETTINGS, NO_HOLIDAYS)).toBe('normal-off');
  });

  it('a college day that is a holiday is normal-off', () => {
    expect(pickTemplateKey('2026-11-03', SETTINGS, new Set(['2026-11-03']))).toBe('normal-off');
  });

  it('a Tuesday inside Ramadan is ramadan-college', () => {
    expect(pickTemplateKey('2027-02-09', RAMADAN, NO_HOLIDAYS)).toBe('ramadan-college');
  });

  it('first and last Ramadan day are inside, the day after is outside', () => {
    expect(pickTemplateKey('2027-02-06', RAMADAN, NO_HOLIDAYS)).toBe('ramadan-off');
    expect(pickTemplateKey('2027-03-07', RAMADAN, NO_HOLIDAYS)).toBe('ramadan-off');
    expect(pickTemplateKey('2027-03-08', RAMADAN, NO_HOLIDAYS)).toBe('normal-college');
  });

  it('an override always wins', () => {
    expect(pickTemplateKey('2026-11-03', SETTINGS, NO_HOLIDAYS, 'normal-off')).toBe('normal-off');
  });
});

describe('resolveTemplate', () => {
  it('drops a room whose end is not after its start', () => {
    const zones: ZoneDef[] = [
      { id: 'zero', name: 'Zero', kind: 'open', start: { t: 'clock', min: 600 }, end: { t: 'clock', min: 600 } },
      { id: 'ok', name: 'Ok', kind: 'open', start: { t: 'clock', min: 700 }, end: { t: 'clock', min: 800 } },
    ];
    expect(resolveTemplate(zones, PRAYERS, SETTINGS).map((z) => z.id)).toEqual(['ok']);
  });

  it('sorts by start and trims an overlap to the previous end', () => {
    const zones: ZoneDef[] = [
      { id: 'late', name: 'Late', kind: 'open', start: { t: 'clock', min: 300 }, end: { t: 'clock', min: 900 } },
      { id: 'early', name: 'Early', kind: 'open', start: { t: 'clock', min: 100 }, end: { t: 'clock', min: 600 } },
    ];
    const out = resolveTemplate(zones, PRAYERS, SETTINGS);
    expect(out.map((z) => z.id)).toEqual(['early', 'late']);
    expect(out[0].startMin).toBe(100);
    expect(out[0].endMin).toBe(600);
    expect(out[1].startMin).toBe(600);
    expect(out[1].endMin).toBe(900);
  });

  it('ramadan-off puts Taraweeh from Isha to Isha+90 and Night Lab at the same minute', () => {
    const prayerMin = { ...PRAYERS, isha: 1200 };
    const out = resolveTemplate(defaultTemplates['ramadan-off'], prayerMin, SETTINGS);
    const taraweeh = out.find((z) => z.id === 'taraweeh');
    const night = out.find((z) => z.id === 'night');
    expect(taraweeh?.startMin).toBe(1200);
    expect(taraweeh?.endMin).toBe(1290);
    expect(night?.startMin).toBe(1290);
  });
});
