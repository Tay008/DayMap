import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { PRAYER_ORDER, prayerTimesMs } from '../../lib/prayer';
import type { PrayerName } from '../../lib/prayer';
import { nowMs, todayKey } from '../../lib/time';
import { setAzanTestListener } from '../azanBus';
import Button from './Button';
import './Azan.css';

const FIRED_KEY = 'daymap.azan.fired';
const WINDOW_MS = 2 * 60 * 1000;

function prayerLabel(name: PrayerName): string {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} time`;
}

function readFired(): string | null {
  try {
    return localStorage.getItem(FIRED_KEY);
  } catch {
    return null;
  }
}

function markFired(key: string): void {
  try {
    localStorage.setItem(FIRED_KEY, key);
  } catch {
    // localStorage can be blocked; the prayer may be noticed again this session
  }
}

// Part 7.3: every 15 s, if one of the five prayers passed within the last 2 minutes
// and has not fired today, show the banner and (when enabled) play the azan.
export default function Azan() {
  const { user } = useAuth();
  const settings = useSettings(user?.uid ?? null);
  const [title, setTitle] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const element = new Audio('/audio/azan.mp3');
    element.preload = 'auto';
    audioRef.current = element;
    return () => {
      element.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const enable = (): void => {
      audioRef.current?.load();
      window.removeEventListener('pointerdown', enable);
    };
    window.addEventListener('pointerdown', enable);
    return () => window.removeEventListener('pointerdown', enable);
  }, []);

  function play(): void {
    const element = audioRef.current;
    if (!element) return;
    setNote(null);
    element.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setNote('Tap to enable sound');
      } else {
        setNote('No azan file found.');
      }
    });
  }

  function stop(): void {
    const element = audioRef.current;
    if (element) {
      element.pause();
      element.currentTime = 0;
    }
    setTitle(null);
    setNote(null);
  }

  useEffect(() => {
    setAzanTestListener(() => {
      setTitle('Azan test');
      setNote(null);
      play();
    });
    return () => setAzanTestListener(null);
  }, []);

  useEffect(() => {
    if (!settings) return;

    const check = (): void => {
      const day = todayKey();
      const times = prayerTimesMs(day, settings.lat, settings.lng, settings.adjust);
      const current = nowMs();

      for (const name of PRAYER_ORDER) {
        const passed = current - times[name];
        if (passed < 0 || passed > WINDOW_MS) continue;
        const key = `${day}:${name}`;
        if (readFired() === key) continue;
        markFired(key);
        setTitle(prayerLabel(name));
        setNote(null);
        if (settings.azanSound) play();
        break;
      }
    };

    const initial = window.setTimeout(check, 0);
    const id = window.setInterval(check, 15000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(id);
    };
  }, [settings]);

  if (title === null) return null;

  return (
    <div className="azan" role="status">
      <div className="azan__body">
        <p className="azan__title">{title}</p>
        {note ? <p className="azan__note">{note}</p> : null}
      </div>
      <Button variant="secondary" onClick={stop}>
        Stop
      </Button>
    </div>
  );
}
