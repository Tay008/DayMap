import { useEffect, useState } from 'react';
import { reportError, subscribeHabits } from '../data/repo';
import type { Habit } from '../data/types';

export function useHabits(uid: string | null): Habit[] {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeHabits(uid, setHabits, reportError);
  }, [uid]);

  return habits;
}
