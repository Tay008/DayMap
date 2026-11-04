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
} from '../data/types';

export interface BackupData {
  version: 1;
  exportedAt: number;
  settings: Settings | null;
  domains: Domain[];
  habits: Habit[];
  tasks: Task[];
  logs: Log[];
  holidays: Holiday[];
  dayOverrides: DayOverride[];
  counters: Counter[];
  counterEvents: CounterEvent[];
}

export interface BackupSummary {
  settings: number;
  domains: number;
  habits: number;
  tasks: number;
  logs: number;
  holidays: number;
  dayOverrides: number;
  counters: number;
  counterEvents: number;
  total: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function withId(value: Record<string, unknown>): boolean {
  return typeof value.id === 'string';
}

function withDateKey(value: Record<string, unknown>): boolean {
  return typeof value.dateKey === 'string';
}

// Parse a backup file. This is the untrusted JSON boundary: the top-level shape and
// version are checked, arrays are filtered to records with the ids the app writes,
// then the entries are trusted as the app's own export shape.
export function parseBackup(text: string): BackupData | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(value) || value.version !== 1) return null;

  const settings = isRecord(value.settings) ? (value.settings as unknown as Settings) : null;

  return {
    version: 1,
    exportedAt: typeof value.exportedAt === 'number' ? value.exportedAt : 0,
    settings,
    domains: records(value.domains).filter(withId) as unknown as Domain[],
    habits: records(value.habits).filter(withId) as unknown as Habit[],
    tasks: records(value.tasks).filter(withId) as unknown as Task[],
    logs: records(value.logs).filter(withId) as unknown as Log[],
    holidays: records(value.holidays).filter(withId) as unknown as Holiday[],
    dayOverrides: records(value.dayOverrides).filter(withDateKey) as unknown as DayOverride[],
    counters: records(value.counters).filter(withId) as unknown as Counter[],
    counterEvents: records(value.counterEvents).filter(withId) as unknown as CounterEvent[],
  };
}

export function summarizeBackup(data: BackupData): BackupSummary {
  const counts = {
    settings: data.settings === null ? 0 : 1,
    domains: data.domains.length,
    habits: data.habits.length,
    tasks: data.tasks.length,
    logs: data.logs.length,
    holidays: data.holidays.length,
    dayOverrides: data.dayOverrides.length,
    counters: data.counters.length,
    counterEvents: data.counterEvents.length,
  };
  return {
    ...counts,
    total:
      counts.settings +
      counts.domains +
      counts.habits +
      counts.tasks +
      counts.logs +
      counts.holidays +
      counts.dayOverrides +
      counts.counters +
      counts.counterEvents,
  };
}
