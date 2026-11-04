import { useEffect, useState } from 'react';
import './ClockCheck.css';

const CHECK_INTERVAL_MS = 30 * 60 * 1000;
const TOLERANCE_SECONDS = 120;

// Part 9.6: at app start and every 30 minutes while online, HEAD the app's own address,
// compare its Date header with Date.now(), and warn when the device clock is off by
// more than 120 seconds. If the request fails (offline), say nothing.
export default function ClockCheck() {
  const [offsetMinutes, setOffsetMinutes] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      if (!navigator.onLine) return;
      try {
        const response = await fetch(window.location.href, {
          method: 'HEAD',
          cache: 'no-store',
        });
        const header = response.headers.get('Date');
        if (header === null) return;
        const serverMs = Date.parse(header);
        if (Number.isNaN(serverMs)) return;
        const diffSeconds = (Date.now() - serverMs) / 1000;
        if (cancelled) return;
        setOffsetMinutes(
          Math.abs(diffSeconds) > TOLERANCE_SECONDS
            ? Math.round(Math.abs(diffSeconds) / 60)
            : null,
        );
      } catch {
        if (!cancelled) setOffsetMinutes(null);
      }
    }

    void run();
    const id = window.setInterval(() => void run(), CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (offsetMinutes === null) return null;

  return (
    <div className="clock-check" role="status">
      This device&apos;s clock is off by about {offsetMinutes} minutes. Fix it in your system
      settings.
    </div>
  );
}
