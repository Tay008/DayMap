import { diffDays, type DateKey } from './time';

// The subset of Counter / CounterEvent (src/data/types.ts, Step 4) that streak maths needs.
export interface StreakCounter {
  startDateKey: DateKey;
}

export interface StreakEvent {
  type: 'relapse' | 'urge';
  dateKey: DateKey;
}

export interface StreakStats {
  current: number;
  best: number;
  totalClean: number;
  urges: number;
}

export const MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

// The highest milestone reached at this count, or null below the first one.
export function currentMilestone(current: number): number | null {
  let reached: number | null = null;
  for (const milestone of MILESTONES) {
    if (current >= milestone) reached = milestone;
  }
  return reached;
}

export function streakStats(
  counter: StreakCounter,
  events: StreakEvent[],
  today: DateKey,
): StreakStats {
  const start = counter.startDateKey;
  const relapseDates = [
    ...new Set(
      events.filter((event) => event.type === 'relapse').map((event) => event.dateKey),
    ),
  ]
    .filter((dateKey) => dateKey >= start && dateKey <= today)
    .sort();

  const lastRelapse = relapseDates.length > 0 ? relapseDates[relapseDates.length - 1] : null;
  const current = diffDays(today, lastRelapse ?? start);

  let best = 0;
  let previous = start;
  for (const relapse of relapseDates) {
    best = Math.max(best, diffDays(relapse, previous));
    previous = relapse;
  }
  best = Math.max(best, diffDays(today, previous));

  const relapsesBeforeToday = relapseDates.filter((dateKey) => dateKey < today).length;
  const totalClean = Math.max(0, diffDays(today, start) - relapsesBeforeToday);
  const urges = events.filter((event) => event.type === 'urge').length;

  return { current, best, totalClean, urges };
}
