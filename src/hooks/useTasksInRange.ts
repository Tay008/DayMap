import { useEffect, useState } from 'react';
import { reportError, subscribeTasksInRange } from '../data/repo';
import type { DateKey } from '../lib/time';
import type { Task } from '../data/types';

// Tasks planned inside an inclusive DateKey range (the visible calendar month).
// Changing the range re-subscribes, per Part 5's month-range query.
export function useTasksInRange(uid: string | null, start: DateKey, end: DateKey): Task[] {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!uid || start === '' || end === '') return;
    return subscribeTasksInRange(uid, start, end, setTasks, reportError);
  }, [uid, start, end]);

  return tasks;
}
