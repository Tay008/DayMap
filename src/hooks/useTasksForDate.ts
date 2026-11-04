import { useEffect, useState } from 'react';
import { reportError, subscribeTasksForDate } from '../data/repo';
import type { DateKey } from '../lib/time';
import type { Task } from '../data/types';

export function useTasksForDate(uid: string | null, dateKey: DateKey): Task[] {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!uid || dateKey === '') return;
    return subscribeTasksForDate(uid, dateKey, setTasks, reportError);
  }, [uid, dateKey]);

  return tasks;
}
