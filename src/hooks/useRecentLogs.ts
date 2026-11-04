import { useEffect, useState } from 'react';
import { reportError, subscribeRecentLogs } from '../data/repo';
import type { DateKey } from '../lib/time';
import type { Log } from '../data/types';

export function useRecentLogs(uid: string | null, fromDateKey: DateKey): Log[] {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeRecentLogs(uid, fromDateKey, setLogs, reportError);
  }, [uid, fromDateKey]);

  return logs;
}
