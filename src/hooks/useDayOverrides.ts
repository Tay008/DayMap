import { useEffect, useState } from 'react';
import { reportError, subscribeDayOverrides } from '../data/repo';
import type { DayOverride } from '../data/types';

export function useDayOverrides(uid: string | null): DayOverride[] {
  const [overrides, setOverrides] = useState<DayOverride[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeDayOverrides(uid, setOverrides, reportError);
  }, [uid]);

  return overrides;
}
