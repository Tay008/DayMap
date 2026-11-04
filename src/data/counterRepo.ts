import { deleteDoc, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { reportError, subscribeCollection } from './subscribe';
import type { OnData, OnError, Unsubscribe } from './subscribe';
import { todayKey } from '../lib/time';
import type { Counter, CounterEvent } from './types';

const STORAGE_KEY = 'daymap.counters.v1';

export interface CounterData { counters: Counter[]; events: CounterEvent[]; }

export interface CounterInput {
  label: string;
  startDateKey: string;
  localOnly: boolean;
}

export interface CounterEventInput {
  type: CounterEvent['type'];
  note?: string;
}

interface LocalData { counters: Counter[]; events: CounterEvent[]; }

const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readLocal(): LocalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { counters: [], events: [] };
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return { counters: [], events: [] };
    const counters = Array.isArray(parsed.counters)
      ? parsed.counters.filter(
          (entry): entry is Counter => isRecord(entry) && typeof entry.id === 'string',
        )
      : [];
    const events = Array.isArray(parsed.events)
      ? parsed.events.filter(
          (entry): entry is CounterEvent => isRecord(entry) && typeof entry.id === 'string',
        )
      : [];
    return { counters, events };
  } catch {
    return { counters: [], events: [] };
  }
}

function writeLocal(data: LocalData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    reportError(error);
  }
  for (const listener of listeners) listener();
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

// Local counters come from localStorage; synced ones come from the two Firestore
// collections. Both are merged so the screen does not care where a counter lives.
export function subscribe(
  uid: string | null,
  onData: OnData<CounterData>,
  onError: OnError,
): Unsubscribe {
  let remoteCounters: Counter[] = [];
  let remoteEvents: CounterEvent[] = [];

  const emit = (): void => {
    const local = readLocal();
    onData({
      counters: mergeById(local.counters, remoteCounters),
      events: mergeById(local.events, remoteEvents),
    });
  };

  listeners.add(emit);
  const onStorage = (event: StorageEvent): void => {
    if (event.key === STORAGE_KEY) emit();
  };
  window.addEventListener('storage', onStorage);

  let unsubscribeCounters: Unsubscribe = () => {};
  let unsubscribeEvents: Unsubscribe = () => {};

  if (uid) {
    unsubscribeCounters = subscribeCollection<Counter>(
      uid,
      'counters',
      (data) => {
        remoteCounters = data;
        emit();
      },
      onError,
    );
    unsubscribeEvents = subscribeCollection<CounterEvent>(
      uid,
      'counterEvents',
      (data) => {
        remoteEvents = data;
        emit();
      },
      onError,
    );
  }

  emit();

  return () => {
    listeners.delete(emit);
    window.removeEventListener('storage', onStorage);
    unsubscribeCounters();
    unsubscribeEvents();
  };
}

export function createCounter(uid: string | null, input: CounterInput): Counter {
  const localOnly = input.localOnly || uid === null;
  const counter: Counter = {
    id: crypto.randomUUID(),
    label: input.label,
    startDateKey: input.startDateKey,
    localOnly,
    createdAt: Date.now(),
  };

  if (localOnly) {
    const data = readLocal();
    writeLocal({ counters: [...data.counters, counter], events: data.events });
  } else if (uid) {
    setDoc(doc(db, `users/${uid}/counters/${counter.id}`), counter).catch(reportError);
  }

  return counter;
}

export function addEvent(
  uid: string | null,
  counter: Counter,
  input: CounterEventInput,
): CounterEvent {
  const event: CounterEvent = {
    id: crypto.randomUUID(),
    counterId: counter.id,
    type: input.type,
    dateKey: todayKey(),
    at: Date.now(),
    note: input.note ?? '',
  };

  if (counter.localOnly) {
    const data = readLocal();
    writeLocal({ counters: data.counters, events: [...data.events, event] });
  } else if (uid) {
    setDoc(doc(db, `users/${uid}/counterEvents/${event.id}`), event).catch(reportError);
  }

  return event;
}

export function deleteEvent(uid: string | null, counter: Counter, eventId: string): void {
  if (counter.localOnly) {
    const data = readLocal();
    writeLocal({
      counters: data.counters,
      events: data.events.filter((event) => event.id !== eventId),
    });
  } else if (uid) {
    deleteDoc(doc(db, `users/${uid}/counterEvents/${eventId}`)).catch(reportError);
  }
}

// Moves a counter and its history to the other store, then removes it from the first.
export function setStorage(
  uid: string | null,
  counter: Counter,
  events: CounterEvent[],
  localOnly: boolean,
): void {
  if (!localOnly && uid === null) return;

  const own = events.filter((event) => event.counterId === counter.id);
  const data = readLocal();
  const remainingCounters = data.counters.filter((entry) => entry.id !== counter.id);
  const remainingEvents = data.events.filter((entry) => entry.counterId !== counter.id);

  if (localOnly) {
    writeLocal({
      counters: [...remainingCounters, { ...counter, localOnly: true }],
      events: [...remainingEvents, ...own],
    });
    if (uid) {
      const batch = writeBatch(db);
      batch.delete(doc(db, `users/${uid}/counters/${counter.id}`));
      for (const event of own) {
        batch.delete(doc(db, `users/${uid}/counterEvents/${event.id}`));
      }
      batch.commit().catch(reportError);
    }
    return;
  }

  writeLocal({ counters: remainingCounters, events: remainingEvents });
  if (uid) {
    const batch = writeBatch(db);
    batch.set(doc(db, `users/${uid}/counters/${counter.id}`), { ...counter, localOnly: false });
    for (const event of own) {
      batch.set(doc(db, `users/${uid}/counterEvents/${event.id}`), event);
    }
    batch.commit().catch(reportError);
  }
}

// Backup helpers. Local counters are merged by id, so importing never deletes one
// that is already on this device.
export function readLocalCounters(): CounterData {
  return readLocal();
}

export function importLocalCounters(counters: Counter[], events: CounterEvent[]): void {
  const data = readLocal();
  const counterMap = new Map(data.counters.map((entry) => [entry.id, entry]));
  for (const counter of counters) {
    counterMap.set(counter.id, { ...counter, localOnly: true });
  }
  const eventMap = new Map(data.events.map((entry) => [entry.id, entry]));
  for (const event of events) {
    eventMap.set(event.id, event);
  }
  writeLocal({ counters: [...counterMap.values()], events: [...eventMap.values()] });
}
