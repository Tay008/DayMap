import { describe, expect, it } from 'vitest';
import {
  dayLevel,
  percent,
  lastDateKeys,
  doneCountsByDay,
  domainSlices,
  monthStats,
  heatGridKeys,
} from './stats';

describe('dayLevel', () => {
  it('returns 0 if planned is 0', () => {
    expect(dayLevel(0, 0)).toBe(0);
    expect(dayLevel(5, 0)).toBe(0);
  });
  it('returns 3 if done >= planned', () => {
    expect(dayLevel(3, 3)).toBe(3);
    expect(dayLevel(5, 3)).toBe(3);
  });
  it('returns 2 if done/planned >= 0.5', () => {
    expect(dayLevel(2, 4)).toBe(2);
    expect(dayLevel(1, 2)).toBe(2);
  });
  it('otherwise returns 1', () => {
    expect(dayLevel(0, 5)).toBe(1);
    expect(dayLevel(1, 5)).toBe(1);
  });
});

describe('percent', () => {
  it('rounds and clamps', () => {
    expect(percent(0, 0)).toBe(0);
    expect(percent(1, 3)).toBe(33);
    expect(percent(2, 3)).toBe(67);
    expect(percent(3, 3)).toBe(100);
    expect(percent(5, 3)).toBe(100);
    expect(percent(-1, 5)).toBe(0);
  });
});

describe('lastDateKeys', () => {
  it('oldest first, last is endKey', () => {
    expect(lastDateKeys('2026-11-04', 1)).toEqual(['2026-11-04']);
    expect(lastDateKeys('2026-11-04', 3)).toEqual(['2026-11-02', '2026-11-03', '2026-11-04']);
  });
  it('returns empty for n <= 0', () => {
    expect(lastDateKeys('2026-11-04', 0)).toEqual([]);
  });
});

describe('doneCountsByDay', () => {
  it('counts doneAt ms per key', () => {
    const keys = ['2026-11-02', '2026-11-03', '2026-11-04'];
    const ms1 = new Date(Date.UTC(2026, 10, 3, 12, 0, 0)).getTime(); // Nov 3 UTC
    const ms2 = new Date(Date.UTC(2026, 10, 4, 1, 0, 0)).getTime(); // Nov 4 in PKT? dateKeyFromMs uses +5 offset
    const counts = doneCountsByDay([ms1, ms2], keys);
    expect(counts).toEqual([0, 1, 1]);
  });
});

describe('domainSlices', () => {
  it('counts open tasks per domain, sorts desc, omits zeros', () => {
    const domains = [
      { id: 'a', name: 'A', colorIndex: 1, icon: 'x', order: 1 },
      { id: 'b', name: 'B', colorIndex: 2, icon: 'x', order: 2 },
    ] as any;
    const tasks = [
      { domainId: 'b' },
      { domainId: 'b' },
      { domainId: 'a' },
    ] as any;
    expect(domainSlices(tasks, domains)).toEqual([
      { id: 'b', label: 'B', value: 2 },
      { id: 'a', label: 'A', value: 1 },
    ]);
  });
});

describe('monthStats', () => {
  it('sums and counts perfect days', () => {
    const res = monthStats([
      { done: 3, planned: 3 },
      { done: 1, planned: 2 },
      { done: 0, planned: 0 },
    ]);
    expect(res).toEqual({ done: 4, planned: 5, perfectDays: 1 });
  });
});

describe('heatGridKeys', () => {
  it('is monday-first and last column is current week, marks future', () => {
    // 2026-11-04 is a Wednesday
    const grid = heatGridKeys('2026-11-04', 1);
    expect(grid.length).toBe(7);
    expect(grid[0].key).toBe('2026-11-02'); // Monday
    expect(grid[6].key).toBe('2026-11-08');
    expect(grid.find((g) => g.key === '2026-11-04')?.future).toBe(false);
    expect(grid.find((g) => g.key === '2026-11-05')?.future).toBe(true);
  });
  it('handles Sunday', () => {
    const grid = heatGridKeys('2026-11-01', 1); // Sunday
    expect(grid[0].key).toBe('2026-10-26'); // previous Monday
    expect(grid[6].key).toBe('2026-11-01');
  });
  it('handles Monday', () => {
    const grid = heatGridKeys('2026-11-02', 2);
    expect(grid[0].key).toBe('2026-10-26');
    expect(grid[13].key).toBe('2026-11-08');
  });
});
