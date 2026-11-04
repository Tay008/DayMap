import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDayOverrides } from '../hooks/useDayOverrides';
import { useHolidays } from '../hooks/useHolidays';
import { useTasksInRange } from '../hooks/useTasksInRange';
import { useToday } from '../hooks/useToday';
import { formatDateLong, formatMonth, monthGrid, monthRange, shiftMonth, type DateKey } from '../lib/time';
import { marksForMonth, shortDateLabel, upcoming } from '../lib/calendarMarks';
import { monthStats } from '../lib/stats';
import KindGlyph from '../ui/calendar/KindGlyph';
import '../styles/dm-calendar.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseMonth(param: string | null): { year: number; month: number } | null {
  if (param === null || !/^\d{4}-\d{2}$/.test(param)) return null;
  const year = Number(param.slice(0, 4));
  const month = Number(param.slice(5, 7));
  if (month < 1 || month > 12) return null;
  return { year, month };
}

function IconLeft() {
  return (
    <svg className="dm-i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRight() {
  return (
    <svg className="dm-i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Calendar() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const today = useToday();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [fallbackYear, fallbackMonth] = today.split('-').map(Number);
  const cursor = parseMonth(params.get('month')) ?? { year: fallbackYear, month: fallbackMonth };
  const { year, month } = cursor;
  const { start, end } = monthRange(year, month);

  const tasks = useTasksInRange(uid, start, end);
  const holidays = useHolidays(uid);
  const overrides = useDayOverrides(uid);

  const overrideSet = useMemo(
    () => new Set(overrides.map((entry) => entry.dateKey)),
    [overrides],
  );

  const counts = useMemo(() => {
    const map = new Map<DateKey, number>();
    for (const task of tasks) {
      if (task.plannedDate === null) continue;
      map.set(task.plannedDate, (map.get(task.plannedDate) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const weeks = monthGrid(year, month);
  const allKeys = weeks.flat().filter((k) => k.slice(0, 7) === monthKey);
  const marks = marksForMonth(allKeys, holidays, 0);

  const monthDays = allKeys.map((k) => ({ done: 0, planned: counts.get(k) ?? 0 }));
  const mstats = monthStats(monthDays);
  const upcomingList = upcoming(today, holidays, 3);

  function showMonth(nextYear: number, nextMonth: number): void {
    setParams({ month: `${nextYear}-${String(nextMonth).padStart(2, '0')}` }, { replace: true });
  }

  function step(delta: number): void {
    const [nextYear, nextMonth] = shiftMonth(year, month, delta);
    showMonth(nextYear, nextMonth);
  }

  const monthLabel = formatMonth(year, month);

  return (
    <div className="dm-page">
      <div className="dm-cal-hd">
        <h2 className="dm-cal-title">
          {monthLabel.split(' ')[0]} <span>{monthLabel.split(' ').slice(1).join(' ')}</span>
        </h2>
        <div className="dm-ctl">
          <button className="dm-btn dm-sq" aria-label="Previous month" onClick={() => step(-1)} type="button">
            <IconLeft />
          </button>
          <button className="dm-btn dm-sq" aria-label="Next month" onClick={() => step(1)} type="button">
            <IconRight />
          </button>
        </div>
      </div>
      <p className="dm-sub">
        {mstats.done} of {mstats.planned} tasks done, {mstats.perfectDays} perfect days
      </p>
      {upcomingList.length > 0 ? (
        <section className="dm-up" aria-label="Coming up">
          {upcomingList.map((item) => (
            <div key={item.dateKey + item.name} className={`dm-upc dm-k-${item.kind}`}>
              <b>{item.daysAway === 0 ? 'Today' : item.daysAway}</b>
              <div>
                {item.daysAway > 0 ? <span>{item.daysAway === 1 ? 'day to' : 'days to'}</span> : null}
                <strong>{item.name}</strong>
                <small>{shortDateLabel(item.dateKey)}</small>
              </div>
            </div>
          ))}
        </section>
      ) : null}
      <div className="dm-cal">
        {WEEKDAYS.map((label) => (
          <div key={label} className="dm-dow">
            {label}
          </div>
        ))}
        {weeks.flat().map((key) => {
          if (key.slice(0, 7) !== monthKey) {
            return <div key={key} className="dm-cell dm-out"></div>;
          }
          const count = counts.get(key) ?? 0;
          const isTodayCell = key === today;
          const mark = marks[key];
          const holidaysList = mark?.holidays ?? [];
          const hasOverride = overrideSet.has(key);
          const first = holidaysList[0];
          const extra = holidaysList.length - 1;
          const classes = ['dm-cell'];
          if (isTodayCell) classes.push('dm-today');
          if (holidaysList.length > 0) classes.push('dm-hasband');
          if (mark?.ramadan) classes.push('dm-hasram');
          const ariaParts = [formatDateLong(key).replace(',', '')];
          if (mark?.hijri) {
            ariaParts.push(`${mark.hijri.day} ${mark.hijri.monthName} ${mark.hijri.year}`);
          }
          for (const h of holidaysList) {
            ariaParts.push(`${h.name} (${h.kind} holiday)`);
          }
          if (count > 0) ariaParts.push(`${count} tasks`);
          return (
            <button
              key={key}
              type="button"
              className={classes.join(' ')}
              aria-label={ariaParts.join(', ')}
              title={ariaParts.join(', ')}
              onClick={() => navigate(`/day/${key}`)}
            >
              {first ? (
                <span className={`dm-band dm-k-${first.kind}${first.tentative ? ' dm-tent' : ''}`}>
                  <KindGlyph kind={first.kind} />
                  <em>{first.name}</em>
                  {extra > 0 ? <i>+{extra}</i> : null}
                </span>
              ) : null}
              <span className="dm-cn">
                <b>{Number(key.slice(8, 10))}</b>
                {mark?.hijri ? (
                  <small className={`dm-hj${mark.hijri.isFirst ? ' dm-hj-first' : ''}`}>
                    {mark.hijri.isFirst ? mark.hijri.monthName.split(' ')[0] : mark.hijri.day}
                  </small>
                ) : null}
                {hasOverride ? <i className="dm-ovr" title="Day type override" /> : null}
              </span>
              {mark?.ramadan ? <span className="dm-ram" /> : null}
              {count > 0 ? <span className="dm-count">{count}</span> : null}
            </button>
          );
        })}
      </div>
      <ul className="dm-key">
        <li>
          <span className="dm-kw dm-k-public">
            <KindGlyph kind="public" />
          </span>
          Public holiday
        </li>
        <li>
          <span className="dm-kw dm-k-religious">
            <KindGlyph kind="religious" />
          </span>
          Religious, dashed means the moon may shift it a day
        </li>
        <li>
          <span className="dm-kw dm-k-optional">
            <KindGlyph kind="optional" />
          </span>
          Optional
        </li>
        <li>
          <span className="dm-kw dm-k-personal">
            <KindGlyph kind="personal" />
          </span>
          Personal
        </li>
        <li>
          <span className="dm-kw dm-kr" />
          Ramadan
        </li>
      </ul>
    </div>
  );
}
