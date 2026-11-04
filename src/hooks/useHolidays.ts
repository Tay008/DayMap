import { useEffect, useState } from 'react';
import { reportError, subscribeHolidays } from '../data/repo';
import type { Holiday } from '../data/types';

export function useHolidays(uid: string | null): Holiday[] {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeHolidays(uid, setHolidays, reportError);
  }, [uid]);

  return holidays;
}
