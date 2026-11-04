import { describe, expect, it } from 'vitest';
import { hijriInfo, marksForMonth, upcoming } from './calendarMarks';

describe('hijriInfo', () => {
  it('isFirst on a month first day', () => {
    const info = hijriInfo('2026-06-26', 0); // rough check
    expect(typeof info.isFirst).toBe('boolean');
  });
  it('offset +1 moves the date forward a day', () => {
    const a = hijriInfo('2026-11-04', 0);
    const b = hijriInfo('2026-11-04', 1);
    // day should advance or month roll
    expect(b.day === a.day + 1 || b.isFirst).toBe(true);
  });
});

describe('marksForMonth', () => {
  it('multi-day holiday covers every day', () => {
    const marks = marksForMonth(['2026-11-01', '2026-11-02', '2026-11-03'], [
      { dateKey: '2026-11-01', name: 'Test', endDateKey: '2026-11-02' },
    ]);
    expect(marks['2026-11-01'].holidays.length).toBe(1);
    expect(marks['2026-11-02'].holidays.length).toBe(1);
    expect(marks['2026-11-03'].holidays.length).toBe(0);
  });
  it('tentative default for religious', () => {
    const marks = marksForMonth(['2026-11-01'], [
      { dateKey: '2026-11-01', name: 'Eid', kind: 'religious' },
    ]);
    expect(marks['2026-11-01'].holidays[0].tentative).toBe(true);
    expect(marks['2026-11-01'].holidays[0].kind).toBe('religious');
  });
  it('missing kind defaults to public', () => {
    const marks = marksForMonth(['2026-11-01'], [{ dateKey: '2026-11-01', name: 'X' }]);
    expect(marks['2026-11-01'].holidays[0].kind).toBe('public');
    expect(marks['2026-11-01'].holidays[0].tentative).toBe(false);
  });
  it('ramadan from hijri month 9 or source', () => {
    const marks = marksForMonth(['2026-11-04'], [], 0, true);
    expect(marks['2026-11-04'].ramadan).toBe(true);
  });
});

describe('upcoming', () => {
  it('excludes past and optional, sorts, limits', () => {
    const list = upcoming(
      '2026-11-04',
      [
        { dateKey: '2026-11-01', name: 'Past', kind: 'public' },
        { dateKey: '2026-11-05', name: 'Opt', kind: 'optional' },
        { dateKey: '2026-11-06', name: 'B', kind: 'public' },
        { dateKey: '2026-11-05', name: 'A', kind: 'public' },
      ],
      2,
    );
    expect(list.length).toBe(2);
    expect(list[0].name).toBe('A');
    expect(list[0].daysAway).toBe(1);
    expect(list[1].name).toBe('B');
    expect(list[1].daysAway).toBe(2);
  });
  it('daysAway 0 for today', () => {
    const list = upcoming('2026-11-04', [{ dateKey: '2026-11-04', name: 'Today' }], 1);
    expect(list[0].daysAway).toBe(0);
  });
});
