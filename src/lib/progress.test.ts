import { describe, expect, it } from 'vitest';
import {
  backlogOf,
  computeDoneAt,
  dayProgress,
  doneAmount,
  fraction,
  groupByRoom,
  halfAmount,
  isDone,
  progressOf,
  remaining,
} from './progress';
import type { ProgressTask } from './progress';

function task(partial: Partial<ProgressTask>): ProgressTask {
  return {
    id: 't',
    target: 1,
    plannedDate: null,
    kind: 'one_off',
    priority: 2,
    createdAt: Date.UTC(2026, 9, 25),
    doneAt: null,
    zoneId: null,
    ...partial,
  };
}

describe('progress maths', () => {
  it('remaining and fraction of a part-done task', () => {
    const t = task({ target: 6, progress: 4 });
    expect(remaining(t)).toBe(2);
    expect(fraction(t)).toBeCloseTo(0.67, 2);
    expect(progressOf(t)).toBe(4);
    expect(progressOf(task({ target: 6 }))).toBe(0);
    expect(doneAmount(t)).toBe(2);
  });

  it('halfAmount never goes past what is left', () => {
    expect(halfAmount(task({ target: 6, progress: 5 }))).toBe(1);
    expect(halfAmount(task({ target: 6, progress: 0 }))).toBe(3);
  });

  it('computeDoneAt clears doneAt after an undo drops below the target', () => {
    const now = 1000;
    expect(computeDoneAt(6, 6, null, now)).toBe(now);
    expect(computeDoneAt(6, 6, 500, now)).toBe(500);
    expect(computeDoneAt(4, 6, 500, now)).toBeNull();
    expect(computeDoneAt(4, 6, null, now)).toBeNull();
  });

  it('isDone', () => {
    expect(isDone(task({ target: 3, progress: 3 }))).toBe(true);
    expect(isDone(task({ target: 3, progress: 2 }))).toBe(false);
  });
});

describe('dayProgress', () => {
  it('averages the fractions and counts done', () => {
    const tasks = [
      task({ id: 'a', target: 1, progress: 1 }),
      task({ id: 'b', target: 2, progress: 1 }),
    ];
    expect(dayProgress(tasks)).toEqual({ percent: 75, done: 1, total: 2 });
  });

  it('is null with no tasks', () => {
    expect(dayProgress([])).toBeNull();
  });
});

describe('backlogOf', () => {
  const today = '2026-10-31';

  const unplanned = task({ id: 'unplanned', priority: 2, createdAt: Date.UTC(2026, 9, 20) });
  const yesterday = task({ id: 'yesterday', priority: 1, plannedDate: '2026-10-30' });
  const plannedToday = task({ id: 'today', priority: 1, plannedDate: '2026-10-31' });
  const done = task({ id: 'done', target: 1, progress: 1, createdAt: Date.UTC(2026, 9, 1) });
  const dailyGoal = task({ id: 'goal', kind: 'daily_goal', priority: 1 });
  const older = task({ id: 'older', priority: 3, plannedDate: '2026-10-25' });

  it('keeps unplanned and past one-offs, drops today/done/daily goals, sorts right', () => {
    const out = backlogOf(
      [unplanned, yesterday, plannedToday, done, dailyGoal, older],
      today,
    );
    expect(out.map((t) => t.id)).toEqual(['yesterday', 'unplanned', 'older']);
    expect(out.map((t) => t.ageDays)).toEqual([1, 11, 6]);
  });
});

describe('groupByRoom', () => {
  it('sorts inside rooms and sends missing/blank zone ids to unplaced', () => {
    const zones = [{ id: 'study' }, { id: 'night' }];
    const tasks = [
      task({ id: 'a', zoneId: 'study', priority: 3, createdAt: 1 }),
      task({ id: 'b', zoneId: 'study', priority: 1, createdAt: 2 }),
      task({ id: 'c', zoneId: null, priority: 2, createdAt: 3 }),
      task({ id: 'd', zoneId: 'missing', priority: 1, createdAt: 4 }),
    ];
    const grouped = groupByRoom(tasks, zones);
    expect(grouped.study.map((t) => t.id)).toEqual(['b', 'a']);
    expect(grouped.night).toEqual([]);
    expect(grouped.unplaced.map((t) => t.id)).toEqual(['d', 'c']);
  });
});
