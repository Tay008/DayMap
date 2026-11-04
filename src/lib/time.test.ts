import { describe, expect, it } from 'vitest';
import {
  addDays,
  dateKeyFromMs,
  dayStartMs,
  diffDays,
  formatClock,
  formatCountdown,
  formatDateLong,
  formatMinutes,
  formatMonth,
  formatTimer,
  fromTimeInput,
  monthGrid,
  monthRange,
  nowMs,
  shiftMonth,
  toTimeInput,
  weekdayOf,
} from './time';

describe('time', () => {
  it('dateKeyFromMs uses the fixed +5 offset (UTC and Asia/Karachi identical)', () => {
    expect(dateKeyFromMs(Date.UTC(2026, 9, 31, 18, 59, 59))).toBe('2026-10-31');
    expect(dateKeyFromMs(Date.UTC(2026, 9, 31, 19, 0, 0))).toBe('2026-11-01');
  });

  it('addDays handles month ends and leap years', () => {
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('diffDays and weekdayOf', () => {
    expect(diffDays('2026-11-01', '2026-10-31')).toBe(1);
    expect(weekdayOf('2026-10-31')).toBe(6); // Saturday
  });

  it('dayStartMs gives the instant a Pakistan day begins', () => {
    expect(dayStartMs('2026-11-01')).toBe(Date.UTC(2026, 9, 31, 19, 0, 0));
  });

  it('nowMs returns a positive epoch time', () => {
    expect(nowMs()).toBeGreaterThan(1_600_000_000_000);
  });

  it('toTimeInput and fromTimeInput round-trip', () => {
    expect(toTimeInput(1350)).toBe('22:30');
    expect(toTimeInput(0)).toBe('00:00');
    expect(toTimeInput(1440)).toBe('00:00');
    expect(fromTimeInput('22:30')).toBe(1350);
    expect(fromTimeInput('07:05')).toBe(425);
    expect(fromTimeInput('25:00')).toBeNull();
    expect(fromTimeInput('7:5')).toBeNull();
    expect(fromTimeInput('nope')).toBeNull();
  });

  it('formatClock, formatMinutes and formatDateLong', () => {
    expect(formatClock(Date.UTC(2026, 9, 31, 11, 32))).toBe('4:32 PM');
    expect(formatMinutes(1350)).toBe('10:30 PM');
    expect(formatDateLong('2026-10-31')).toBe('Saturday, 31 October 2026');
  });

  it('formatCountdown rounds up and skips empty units', () => {
    expect(formatCountdown(72 * 60000)).toBe('1h 12m');
    expect(formatCountdown(5 * 60000)).toBe('5m');
    expect(formatCountdown(2 * 3600000)).toBe('2h');
    expect(formatCountdown(0)).toBe('0m');
    expect(formatCountdown(-1000)).toBe('0m');
  });

  it('formatTimer renders mm:ss and clamps negatives', () => {
    expect(formatTimer(600)).toBe('10:00');
    expect(formatTimer(59)).toBe('0:59');
    expect(formatTimer(0)).toBe('0:00');
    expect(formatTimer(-5)).toBe('0:00');
  });

  it('monthRange, shiftMonth and formatMonth', () => {
    expect(monthRange(2026, 10)).toEqual({ start: '2026-10-01', end: '2026-10-31' });
    expect(monthRange(2028, 2).end).toBe('2028-02-29');
    expect(monthRange(2026, 12).end).toBe('2026-12-31');
    expect(shiftMonth(2026, 1, -1)).toEqual([2025, 12]);
    expect(shiftMonth(2026, 12, 1)).toEqual([2027, 1]);
    expect(shiftMonth(2026, 6, 7)).toEqual([2027, 1]);
    expect(formatMonth(2026, 10)).toBe('October 2026');
  });

  it('monthGrid starts on Monday and covers the whole month', () => {
    const weeks = monthGrid(2026, 10);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weekdayOf(weeks[0][0])).toBe(1); // Monday
    const flat = weeks.flat();
    expect(flat).toContain('2026-10-01');
    expect(flat).toContain('2026-10-31');
  });
});
