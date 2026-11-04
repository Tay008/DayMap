import { useEffect, useState } from 'react';
import { todayKey, type DateKey } from '../lib/time';

// Today's DateKey, refreshed every 30 seconds so the app moves to the new day at midnight.
export function useToday(): DateKey {
  const [today, setToday] = useState<DateKey>(() => todayKey());

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = todayKey();
      setToday((current) => (current === next ? current : next));
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  return today;
}
