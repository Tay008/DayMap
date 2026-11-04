import { dayProgress, groupByRoom } from '../lib/progress';
import type { DayProgress } from '../lib/progress';
import type { DateKey } from '../lib/time';
import type { Task } from '../data/types';
import { useAuth } from './useAuth';
import { useDayTemplate } from './useDayTemplate';
import type { DayTemplate } from './useDayTemplate';
import { useTasksForDate } from './useTasksForDate';

export interface DayData extends DayTemplate {
  dateKey: DateKey;
  tasks: Task[];
  tasksByRoom: Record<string, Task[]>;
  unplaced: Task[];
  progress: DayProgress | null;
}

export function useDay(dateKey: DateKey | null): DayData | null {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const template = useDayTemplate(uid, dateKey);
  const tasks = useTasksForDate(uid, dateKey ?? '');

  if (!dateKey || !template) return null;

  const tasksByRoom = groupByRoom(tasks, template.rooms);

  return {
    ...template,
    dateKey,
    tasks,
    tasksByRoom,
    unplaced: tasksByRoom.unplaced ?? [],
    progress: dayProgress(tasks),
  };
}
