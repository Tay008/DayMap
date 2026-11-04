import { useEffect, useState } from 'react';
import { subscribe } from '../data/counterRepo';
import type { CounterData } from '../data/counterRepo';
import { reportError } from '../data/repo';

export function useCounters(uid: string | null): CounterData {
  const [data, setData] = useState<CounterData>({ counters: [], events: [] });

  useEffect(() => subscribe(uid, setData, reportError), [uid]);

  return data;
}
