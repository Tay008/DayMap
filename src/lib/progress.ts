import { dateKeyFromMs, diffDays, type DateKey } from './time';

// The subset of Task (src/data/types.ts, Step 4) that progress maths needs.
export interface ProgressTask {
  id: string;
  target: number;
  progress?: number;
  plannedDate: DateKey | null;
  kind: 'one_off' | 'daily_goal';
  priority: 1 | 2 | 3;
  createdAt: number;
  doneAt: number | null;
  zoneId: string | null;
}

export interface BacklogTask extends ProgressTask {
  ageDays: number;
}

export interface DayProgress {
  percent: number;
  done: number;
  total: number;
}

export function progressOf(task: ProgressTask): number {
  return task.progress ?? 0;
}

export function isDone(task: ProgressTask): boolean {
  return progressOf(task) >= task.target;
}

export function remaining(task: ProgressTask): number {
  return Math.max(0, task.target - progressOf(task));
}

export function fraction(task: ProgressTask): number {
  return Math.min(1, progressOf(task) / task.target);
}

export function computeDoneAt(
  progress: number,
  target: number,
  existing: number | null,
  now = Date.now(),
): number | null {
  return progress >= target ? (existing ?? now) : null;
}

export function doneAmount(task: ProgressTask): number {
  return remaining(task);
}

export function halfAmount(task: ProgressTask): number {
  return Math.min(remaining(task), Math.ceil(task.target * 0.5));
}

export function dayProgress(tasks: ProgressTask[]): DayProgress | null {
  if (tasks.length === 0) return null;
  const total = tasks.length;
  const done = tasks.filter(isDone).length;
  const sum = tasks.reduce((acc, task) => acc + fraction(task), 0);
  return { percent: Math.round((sum / total) * 100), done, total };
}

export function backlogOf<T extends ProgressTask>(
  openOneOffs: T[],
  today: DateKey,
): (T & { ageDays: number })[] {
  return openOneOffs
    .filter(
      (task) =>
        task.kind === 'one_off' &&
        !isDone(task) &&
        (task.plannedDate === null || task.plannedDate < today),
    )
    .map((task) => ({
      ...task,
      ageDays:
        task.plannedDate !== null
          ? diffDays(today, task.plannedDate)
          : diffDays(today, dateKeyFromMs(task.createdAt)),
    }))
    .sort((a, b) => a.priority - b.priority || b.ageDays - a.ageDays);
}

export type TasksByRoom = Record<string, ProgressTask[]>;

export function groupByRoom<T extends ProgressTask>(
  tasks: T[],
  zones: { id: string }[],
): Record<string, T[]> {
  const ids = new Set(zones.map((zone) => zone.id));
  const out: Record<string, T[]> = { unplaced: [] };
  for (const zone of zones) out[zone.id] = [];

  for (const task of tasks) {
    const key = task.zoneId !== null && ids.has(task.zoneId) ? task.zoneId : 'unplaced';
    out[key].push(task);
  }

  const byPriorityThenAge = (a: T, b: T) =>
    a.priority - b.priority || a.createdAt - b.createdAt;
  for (const key of Object.keys(out)) out[key].sort(byPriorityThenAge);
  return out;
}
