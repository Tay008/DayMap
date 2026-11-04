import { collection, deleteDoc, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { reportError, subscribeCollection, subscribeDocument } from './subscribe';
import type { OnData, OnError, Unsubscribe } from './subscribe';
import { todayKey, weekdayOf, type DateKey } from '../lib/time';
import type { DayOverride, Domain, Habit, Holiday, Settings, Task } from './types';

// The task functions live in ./tasks and the shared plumbing in ./subscribe; both are
// re-exported here so `import { createTask } from '../data/repo'` keeps working.
export * from './subscribe';
export * from './tasks';

export function subscribeSettings(
  uid: string,
  onData: (settings: Settings | null) => void,
  onError: OnError,
): Unsubscribe {
  return subscribeDocument<Settings>(uid, 'settings/main', onData, onError);
}

export function subscribeDomains(
  uid: string,
  onData: OnData<Domain[]>,
  onError: OnError,
): Unsubscribe {
  return subscribeCollection<Domain>(uid, 'domains', onData, onError, 'order');
}

export function subscribeHabits(
  uid: string,
  onData: OnData<Habit[]>,
  onError: OnError,
): Unsubscribe {
  return subscribeCollection<Habit>(uid, 'habits', onData, onError);
}

export function subscribeHolidays(
  uid: string,
  onData: OnData<Holiday[]>,
  onError: OnError,
): Unsubscribe {
  return subscribeCollection<Holiday>(uid, 'holidays', onData, onError);
}

export function subscribeDayOverrides(
  uid: string,
  onData: OnData<DayOverride[]>,
  onError: OnError,
): Unsubscribe {
  return subscribeCollection<DayOverride>(uid, 'dayOverrides', onData, onError);
}

// Syncing = the tasks listener has pending writes (Part 5 sync status chip).
export function subscribeSyncPending(
  uid: string,
  onPending: (pending: boolean) => void,
  onError: OnError,
): Unsubscribe {
  return onSnapshot(
    collection(db, `users/${uid}/tasks`),
    { includeMetadataChanges: true },
    (snapshot) => onPending(snapshot.metadata.hasPendingWrites),
    onError,
  );
}

// Write functions return void and never await: offline the promise does not resolve
// until the server answers, so we fire it and attach .catch(reportError) (Part 3 rule 5).
export function saveSettings(uid: string, settings: Settings): void {
  setDoc(doc(db, `users/${uid}/settings/main`), settings).catch(reportError);
}

export function saveDomain(uid: string, domain: Domain): void {
  setDoc(doc(db, `users/${uid}/domains/${domain.id}`), domain).catch(reportError);
}

export function saveHabit(uid: string, habit: Habit): void {
  setDoc(doc(db, `users/${uid}/habits/${habit.id}`), habit).catch(reportError);
}

export function saveHoliday(uid: string, holiday: Holiday): void {
  setDoc(doc(db, `users/${uid}/holidays/${holiday.id}`), holiday).catch(reportError);
}

export function saveDayOverride(uid: string, override: DayOverride): void {
  setDoc(doc(db, `users/${uid}/dayOverrides/${override.dateKey}`), override).catch(reportError);
}

export function deleteDayOverride(uid: string, dateKey: DateKey): void {
  deleteDoc(doc(db, `users/${uid}/dayOverrides/${dateKey}`)).catch(reportError);
}

export function deleteDomain(uid: string, domainId: string): void {
  deleteDoc(doc(db, `users/${uid}/domains/${domainId}`)).catch(reportError);
}

export function deleteHoliday(uid: string, holidayId: string): void {
  deleteDoc(doc(db, `users/${uid}/holidays/${holidayId}`)).catch(reportError);
}

// Daily goal instances use a fixed id `${habitId}_${dateKey}` so two devices creating the
// same day write identical data and nothing is lost. They never include `progress`, and an
// existing instance is left untouched (so a re-open cannot clear a finished one).
export function ensureHabitInstances(uid: string, dateKey: DateKey, habits: Habit[]): void {
  if (dateKey < todayKey()) return; // today or later only
  const weekday = weekdayOf(dateKey);
  const now = Date.now();

  for (const habit of habits) {
    if (!habit.active || !habit.daysOfWeek.includes(weekday)) continue;
    const id = `${habit.id}_${dateKey}`;
    const ref = doc(db, `users/${uid}/tasks/${id}`);
    const instance: Task = {
      id,
      title: habit.title,
      domainId: habit.domainId,
      priority: habit.priority,
      kind: 'daily_goal',
      target: habit.target,
      unit: habit.unit,
      plannedDate: dateKey,
      zoneId: null,
      notes: '',
      habitId: habit.id,
      doneAt: null,
      createdAt: now,
      updatedAt: now,
    };
    getDoc(ref)
      .then((snapshot) => {
        if (snapshot.exists()) return;
        setDoc(ref, instance, { merge: true }).catch(reportError);
      })
      .catch(reportError);
  }
}

export function deleteHabit(uid: string, habitId: string): void {
  deleteDoc(doc(db, `users/${uid}/habits/${habitId}`)).catch(reportError);
}

export function setHabitActive(uid: string, habit: Habit, active: boolean): void {
  saveHabit(uid, { ...habit, active, updatedAt: Date.now() });
}
