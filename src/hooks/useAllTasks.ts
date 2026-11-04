import { useEffect, useState } from 'react';
import { reportError, subscribeAllTasks } from '../data/repo';
import type { Task } from '../data/types';

export function useAllTasks(uid: string | null): Task[] {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeAllTasks(uid, setTasks, reportError);
  }, [uid]);

  return tasks;
}
