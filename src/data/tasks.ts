import {
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { reportError } from './subscribe';
import type { OnData, OnError, Unsubscribe } from './subscribe';
import { todayKey, type DateKey } from '../lib/time';
import { computeDoneAt } from '../lib/progress';
import type { Log, Priority, Task } from './types';

export interface TaskInput {
  title: string;
  domainId: string;
  priority: Priority;
  kind: 'one_off' | 'daily_goal';
  target: number;
  unit: string;
  plannedDate: DateKey | null;
  zoneId: string | null;
  notes: string;
  habitId: string | null;
}

function subscribeTasks(
  uid: string,
  constraints: QueryConstraint[],
  onData: OnData<Task[]>,
  onError: OnError,
): Unsubscribe {
  const target = query(collection(db, `users/${uid}/tasks`), ...constraints);
  return onSnapshot(
    target,
    (snapshot) => onData(snapshot.docs.map((entry) => entry.data() as Task)),
    onError,
  );
}

export function subscribeTasksForDate(
  uid: string,
  dateKey: DateKey,
  onData: OnData<Task[]>,
  onError: OnError,
): Unsubscribe {
  return subscribeTasks(uid, [where('plannedDate', '==', dateKey)], onData, onError);
}

export function subscribeOpenOneOffs(
  uid: string,
  onData: OnData<Task[]>,
  onError: OnError,
): Unsubscribe {
  return subscribeTasks(
    uid,
    [where('kind', '==', 'one_off'), where('doneAt', '==', null)],
    onData,
    onError,
  );
}

export function subscribeTasksInRange(
  uid: string,
  start: DateKey,
  end: DateKey,
  onData: OnData<Task[]>,
  onError: OnError,
): Unsubscribe {
  return subscribeTasks(
    uid,
    [where('plannedDate', '>=', start), where('plannedDate', '<=', end)],
    onData,
    onError,
  );
}

export function subscribeRecentDone(
  uid: string,
  cutoffMs: number,
  onData: OnData<Task[]>,
  onError: OnError,
): Unsubscribe {
  return subscribeTasks(uid, [where('doneAt', '>=', cutoffMs)], onData, onError);
}

export function subscribeRecentLogs(
  uid: string,
  fromDateKey: DateKey,
  onData: OnData<Log[]>,
  onError: OnError,
): Unsubscribe {
  const target = query(collection(db, `users/${uid}/logs`), where('dateKey', '>=', fromDateKey));
  return onSnapshot(
    target,
    (snapshot) => onData(snapshot.docs.map((entry) => entry.data() as Log)),
    onError,
  );
}

// Whole-collection listener, used to refuse deleting a domain that still has tasks.
export function subscribeAllTasks(
  uid: string,
  onData: OnData<Task[]>,
  onError: OnError,
): Unsubscribe {
  return subscribeTasks(uid, [], onData, onError);
}

// Creating a task writes every field except progress, and always writes doneAt: null.
export function createTask(uid: string, input: TaskInput): void {
  const now = Date.now();
  const id = crypto.randomUUID();
  const task = { id, ...input, doneAt: null, createdAt: now, updatedAt: now };
  setDoc(doc(db, `users/${uid}/tasks/${id}`), task).catch(reportError);
}

export function updateTask(uid: string, task: Task, changes: Partial<TaskInput>): void {
  const now = Date.now();
  const target = changes.target ?? task.target;
  const doneAt = computeDoneAt(task.progress ?? 0, target, task.doneAt, now);
  updateDoc(doc(db, `users/${uid}/tasks/${task.id}`), {
    ...changes,
    doneAt,
    updatedAt: now,
  }).catch(reportError);
}

export function deleteTask(uid: string, taskId: string): void {
  deleteDoc(doc(db, `users/${uid}/tasks/${taskId}`)).catch(reportError);
}

export function planTask(
  uid: string,
  taskId: string,
  plannedDate: DateKey | null,
  zoneId: string | null,
): void {
  updateDoc(doc(db, `users/${uid}/tasks/${taskId}`), {
    plannedDate,
    zoneId,
    updatedAt: Date.now(),
  }).catch(reportError);
}

export function logProgress(uid: string, task: Task, amount: number): void {
  const now = Date.now();
  const newProgress = (task.progress ?? 0) + amount;
  const logId = crypto.randomUUID();
  const batch = writeBatch(db);
  batch.set(doc(db, `users/${uid}/logs/${logId}`), {
    id: logId,
    taskId: task.id,
    amount,
    dateKey: todayKey(),
    at: now,
  });
  batch.update(doc(db, `users/${uid}/tasks/${task.id}`), {
    progress: increment(amount),
    doneAt: computeDoneAt(newProgress, task.target, task.doneAt, now),
    updatedAt: now,
  });
  batch.commit().catch(reportError);
}

// Undo deletes the newest log and applies increment(-amount) in one batch.
export function undoLastLog(uid: string, task: Task, log: Log): void {
  const now = Date.now();
  const newProgress = Math.max(0, (task.progress ?? 0) - log.amount);
  const batch = writeBatch(db);
  batch.delete(doc(db, `users/${uid}/logs/${log.id}`));
  batch.update(doc(db, `users/${uid}/tasks/${task.id}`), {
    progress: increment(-log.amount),
    doneAt: computeDoneAt(newProgress, task.target, task.doneAt, now),
    updatedAt: now,
  });
  batch.commit().catch(reportError);
}
