import { describe, expect, it } from 'vitest';
import { currentMilestone, streakStats } from './streaks';
import type { StreakCounter, StreakEvent } from './streaks';

const counter: StreakCounter = { startDateKey: '2026-10-01' };
const today = '2026-10-31';

const relapse = (dateKey: string): StreakEvent => ({ type: 'relapse', dateKey });
const urge = (dateKey: string): StreakEvent => ({ type: 'urge', dateKey });

describe('streakStats', () => {
  it('no events: current, best and totalClean all equal the span', () => {
    expect(streakStats(counter, [], today)).toEqual({
      current: 30,
      best: 30,
      totalClean: 30,
      urges: 0,
    });
  });

  it('one relapse resets current, leaves best/total accounting for it', () => {
    expect(streakStats(counter, [relapse('2026-10-10')], today)).toEqual({
      current: 21,
      best: 21,
      totalClean: 29,
      urges: 0,
    });
  });

  it('two relapses on the same date count as one', () => {
    expect(streakStats(counter, [relapse('2026-10-10'), relapse('2026-10-10')], today)).toEqual({
      current: 21,
      best: 21,
      totalClean: 29,
      urges: 0,
    });
  });

  it('a relapse today gives current 0 but keeps the best', () => {
    expect(streakStats(counter, [relapse('2026-10-31')], today)).toEqual({
      current: 0,
      best: 30,
      totalClean: 30,
      urges: 0,
    });
  });

  it('a relapse dated before the start date is ignored', () => {
    expect(streakStats(counter, [relapse('2026-09-15')], today)).toEqual({
      current: 30,
      best: 30,
      totalClean: 30,
      urges: 0,
    });
  });

  it('counts urges', () => {
    expect(streakStats(counter, [urge('2026-10-05'), urge('2026-10-06')], today).urges).toBe(2);
  });
});

describe('currentMilestone', () => {
  it('returns the highest milestone reached', () => {
    expect(currentMilestone(2)).toBeNull();
    expect(currentMilestone(3)).toBe(3);
    expect(currentMilestone(29)).toBe(14);
    expect(currentMilestone(30)).toBe(30);
    expect(currentMilestone(120)).toBe(90);
    expect(currentMilestone(400)).toBe(365);
  });
});
