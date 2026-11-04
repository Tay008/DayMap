import { useEffect, useState } from 'react';
import { reportError, subscribeRecentDone } from '../data/repo';
import type { Task } from '../data/types';

export function useRecentDone(uid: string | null, cutoffMs: number): Task[] {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeRecentDone(uid, cutoffMs, setTasks, reportError);
  }, [uid, cutoffMs]);

  return tasks;
}
