import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import { importLocalCounters, readLocalCounters } from './counterRepo';
import type { BackupData } from '../lib/backup';
import type {
  Counter,
  CounterEvent,
  DayOverride,
  Domain,
  Habit,
  Holiday,
  Log,
  Settings,
  Task,
} from './types';

const BATCH_SIZE = 400;

type BackupDoc =
  | Settings
  | Domain
  | Habit
  | Task
  | Log
  | Holiday
  | DayOverride
  | Counter
  | CounterEvent;

interface Write {
  collection: string;
  id: string;
  value: BackupDoc;
}

async function readCollection<T>(uid: string, name: string): Promise<T[]> {
  const snapshot = await getDocs(collection(db, `users/${uid}/${name}`));
  return snapshot.docs.map((entry) => entry.data() as T);
}

function mergeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of [...primary, ...secondary]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export async function exportBackup(uid: string): Promise<BackupData> {
  const [
    settingsSnapshot,
    domains,
    habits,
    tasks,
    logs,
    holidays,
    dayOverrides,
    counters,
    counterEvents,
  ] = await Promise.all([
    getDoc(doc(db, `users/${uid}/settings/main`)),
    readCollection<Domain>(uid, 'domains'),
    readCollection<Habit>(uid, 'habits'),
    readCollection<Task>(uid, 'tasks'),
    readCollection<Log>(uid, 'logs'),
    readCollection<Holiday>(uid, 'holidays'),
    readCollection<DayOverride>(uid, 'dayOverrides'),
    readCollection<Counter>(uid, 'counters'),
    readCollection<CounterEvent>(uid, 'counterEvents'),
  ]);

  const local = readLocalCounters();

  return {
    version: 1,
    exportedAt: Date.now(),
    settings: settingsSnapshot.exists() ? (settingsSnapshot.data() as Settings) : null,
    domains,
    habits,
    tasks,
    logs,
    holidays,
    dayOverrides,
    counters: mergeById(counters, local.counters),
    counterEvents: mergeById(counterEvents, local.events),
  };
}

// Writes in batches of 400 by document id. Import never deletes anything, and it is
// the one place a plain `progress` value is written back (it restores saved state).
export async function importBackup(uid: string, data: BackupData): Promise<void> {
  const localCounters = data.counters.filter((counter) => counter.localOnly);
  const localIds = new Set(localCounters.map((counter) => counter.id));
  const localEvents = data.counterEvents.filter((event) => localIds.has(event.counterId));

  if (localCounters.length > 0 || localEvents.length > 0) {
    importLocalCounters(localCounters, localEvents);
  }

  const writes: Write[] = [];
  if (data.settings !== null) {
    writes.push({ collection: 'settings', id: 'main', value: data.settings });
  }
  for (const domain of data.domains) {
    writes.push({ collection: 'domains', id: domain.id, value: domain });
  }
  for (const habit of data.habits) {
    writes.push({ collection: 'habits', id: habit.id, value: habit });
  }
  for (const task of data.tasks) {
    writes.push({ collection: 'tasks', id: task.id, value: task });
  }
  for (const log of data.logs) {
    writes.push({ collection: 'logs', id: log.id, value: log });
  }
  for (const holiday of data.holidays) {
    writes.push({ collection: 'holidays', id: holiday.id, value: holiday });
  }
  for (const override of data.dayOverrides) {
    writes.push({ collection: 'dayOverrides', id: override.dateKey, value: override });
  }
  for (const counter of data.counters) {
    if (!counter.localOnly) {
      writes.push({ collection: 'counters', id: counter.id, value: counter });
    }
  }
  for (const event of data.counterEvents) {
    if (!localIds.has(event.counterId)) {
      writes.push({ collection: 'counterEvents', id: event.id, value: event });
    }
  }

  for (let index = 0; index < writes.length; index += BATCH_SIZE) {
    const batch = writeBatch(db);
    for (const write of writes.slice(index, index + BATCH_SIZE)) {
      batch.set(
        doc(db, `users/${uid}/${write.collection}/${write.id}`),
        write.value as DocumentData,
      );
    }
    await batch.commit();
  }
}
