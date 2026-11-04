import { useEffect, useState } from 'react';
import { nowMs } from '../lib/time';

// A ticking "now" (every 30 s by default) so countdowns update without impure render calls.
export function useNowMs(intervalMs = 30000): number {
  const [now, setNow] = useState(() => nowMs());

  useEffect(() => {
    const id = window.setInterval(() => setNow(nowMs()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
