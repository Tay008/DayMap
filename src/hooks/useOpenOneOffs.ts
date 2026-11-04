import { useEffect, useState } from 'react';
import { reportError, subscribeOpenOneOffs } from '../data/repo';
import type { Task } from '../data/types';

export function useOpenOneOffs(uid: string | null): Task[] {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeOpenOneOffs(uid, setTasks, reportError);
  }, [uid]);

  return tasks;
}
