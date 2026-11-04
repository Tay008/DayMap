import { useState } from 'react';
import { saveSettings } from '../data/repo';
import type { Settings as SettingsDoc } from '../data/types';
import { PRAYER_ORDER, prayerMinutes, prayerTimesMs } from '../lib/prayer';
import type { PrayerName } from '../lib/prayer';
import { formatMinutes, fromTimeInput, toTimeInput } from '../lib/time';
import { useAuth } from '../hooks/useAuth';
import { useAzanFileMissing } from '../hooks/useAzanFileMissing';
import { useSettings } from '../hooks/useSettings';
import { useToday } from '../hooks/useToday';
import { setTheme } from '../ui/theme';
import type { ThemeName } from '../ui/theme';
import Button from '../ui/components/Button';
import Chip from '../ui/components/Chip';
import { TextField } from '../ui/components/Field';
import { fireAzanTest } from '../ui/azanBus';
import './Settings.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ADJUSTABLE: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const THEMES: ThemeName[] = ['paper', 'ink', 'moss'];

export default function Settings() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const settings = useSettings(uid);
  const today = useToday();
  const [draft, setDraft] = useState<SettingsDoc | null>(null);
  const [error, setError] = useState('');
  const azanMissing = useAzanFileMissing();

  const loaded = draft ?? settings;
  if (!loaded) return <p className="settings__loading">Loading settings…</p>;

  // `value` is non-nullable from here, so the closures below can use it safely.
  const value = loaded;

  const preview = prayerMinutes(prayerTimesMs(today, value.lat, value.lng, value.adjust));

  function update(patch: Partial<SettingsDoc>): void {
    if (!uid) return;
    setError('');
    const next = { ...value, ...patch };
    setDraft(next);
    saveSettings(uid, next);
  }

  function updateNumber(
    raw: string,
    min: number,
    max: number,
    message: string,
    apply: (n: number) => Partial<SettingsDoc>,
  ): void {
    if (raw === '') return;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < min || n > max) {
      setError(message);
      return;
    }
    update(apply(n));
  }

  function toggleDay(day: number): void {
    const days = value.collegeDays.includes(day)
      ? value.collegeDays.filter((entry) => entry !== day)
      : [...value.collegeDays, day].sort((a, b) => a - b);
    update({ collegeDays: days });
  }

  function chooseTheme(name: ThemeName): void {
    setTheme(name);
    update({ theme: name });
  }

  return (
    <div className="settings">
      {error !== '' ? <p className="settings__error">{error}</p> : null}

      <section className="settings__section">
        <h2 className="settings__title">College</h2>
        <div className="settings__row">
          <TextField
            id="set-college-start"
            label="Start"
            type="time"
            value={toTimeInput(value.collegeStart)}
            onChange={(event) => {
              const minutes = fromTimeInput(event.target.value);
              if (minutes !== null) update({ collegeStart: minutes });
            }}
          />
          <TextField
            id="set-college-end"
            label="End"
            type="time"
            value={toTimeInput(value.collegeEnd)}
            onChange={(event) => {
              const minutes = fromTimeInput(event.target.value);
              if (minutes !== null) update({ collegeEnd: minutes });
            }}
          />
        </div>
        <div className="settings__chips">
          {WEEKDAYS.map((label, index) => (
            <Chip
              key={label}
              selected={value.collegeDays.includes(index)}
              onClick={() => toggleDay(index)}
            >
              {label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="settings__section">
        <h2 className="settings__title">Ramadan</h2>
        <TextField
          id="set-ramadan-start"
          label="Start date"
          type="date"
          value={value.ramadanStart ?? ''}
          onChange={(event) =>
            update({ ramadanStart: event.target.value === '' ? null : event.target.value })
          }
        />
        <div className="settings__chips">
          {[29, 30].map((days) => (
            <Chip
              key={days}
              selected={value.ramadanDays === days}
              onClick={() => update({ ramadanDays: days === 29 ? 29 : 30 })}
            >
              {days} days
            </Chip>
          ))}
        </div>
        <TextField
          id="set-taraweeh"
          label="Taraweeh minutes"
          type="number"
          min={20}
          max={240}
          value={String(value.taraweehMinutes)}
          onChange={(event) =>
            updateNumber(event.target.value, 20, 240, 'Taraweeh must be 20 to 240 minutes', (n) => ({
              taraweehMinutes: n,
            }))
          }
        />
        <p className="settings__hint">
          Enter the date after the moon sighting announcement. Ramadan is expected around early
          to mid February 2027.
        </p>
      </section>

      <section className="settings__section">
        <h2 className="settings__title">Prayer</h2>
        <div className="settings__row">
          <TextField
            id="set-lat"
            label="Latitude"
            type="number"
            step="0.0001"
            value={String(value.lat)}
            onChange={(event) =>
              updateNumber(event.target.value, -90, 90, 'Latitude must be -90 to 90', (n) => ({
                lat: n,
              }))
            }
          />
          <TextField
            id="set-lng"
            label="Longitude"
            type="number"
            step="0.0001"
            value={String(value.lng)}
            onChange={(event) =>
              updateNumber(event.target.value, -180, 180, 'Longitude must be -180 to 180', (n) => ({
                lng: n,
              }))
            }
          />
        </div>

        <div className="settings__adjustments">
          {ADJUSTABLE.map((prayer) => (
            <TextField
              key={prayer}
              id={`set-adjust-${prayer}`}
              label={prayer}
              type="number"
              min={-30}
              max={30}
              value={String(value.adjust[prayer])}
              onChange={(event) =>
                updateNumber(event.target.value, -30, 30, 'Adjustments must be -30 to 30', (n) => ({
                  adjust: { ...value.adjust, [prayer]: n },
                }))
              }
            />
          ))}
        </div>

        <ul className="settings__preview">
          {PRAYER_ORDER.map((prayer) => (
            <li key={prayer} className="settings__preview-row">
              <span>{prayer}</span>
              <span className="settings__preview-time">{formatMinutes(preview[prayer])}</span>
            </li>
          ))}
        </ul>

        <div className="settings__chips">
          <Chip selected={value.azanSound} onClick={() => update({ azanSound: !value.azanSound })}>
            Azan sound
          </Chip>
          <Button variant="secondary" onClick={fireAzanTest}>
            Test azan
          </Button>
        </div>
        {azanMissing ? (
          <p className="settings__hint">
            The azan file is missing, so the banner will show without sound.
          </p>
        ) : null}
        <p className="settings__hint">The azan only plays while DayMap is open on that device.</p>
      </section>

      <section className="settings__section">
        <h2 className="settings__title">Theme</h2>
        <div className="settings__chips">
          {THEMES.map((name) => (
            <Chip key={name} selected={value.theme === name} onClick={() => chooseTheme(name)}>
              {name}
            </Chip>
          ))}
        </div>
      </section>
    </div>
  );
}
