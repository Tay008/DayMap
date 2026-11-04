import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDayOverrides } from '../hooks/useDayOverrides';
import { useHolidays } from '../hooks/useHolidays';
import { useTasksInRange } from '../hooks/useTasksInRange';
import { useToday } from '../hooks/useToday';
import {
  formatDateLong,
  formatMonth,
  monthGrid,
  monthRange,
  shiftMonth,
  type DateKey,
} from '../lib/time';
import Button from '../ui/components/Button';
import { iconFor, iconProps } from '../ui/icons';
import './Calendar.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PrevIcon = iconFor('chevron-left');
const NextIcon = iconFor('chevron-right');

// Keep the cell readable on a phone: use the first word, capped at 12 characters.
function shortName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? name;
  return first.length > 12 ? `${first.slice(0, 11)}…` : first;
}

function parseMonth(param: string | null): { year: number; month: number } | null {
  if (param === null || !/^\d{4}-\d{2}$/.test(param)) return null;
  const year = Number(param.slice(0, 4));
  const month = Number(param.slice(5, 7));
  if (month < 1 || month > 12) return null;
  return { year, month };
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

  const counts = useMemo(() => {
    const map = new Map<DateKey, number>();
    for (const task of tasks) {
      if (task.plannedDate === null) continue;
      map.set(task.plannedDate, (map.get(task.plannedDate) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  const holidayMap = useMemo(() => {
    const map = new Map<DateKey, string>();
    for (const holiday of holidays) map.set(holiday.dateKey, holiday.name);
    return map;
  }, [holidays]);

  const overrideSet = useMemo(
    () => new Set(overrides.map((entry) => entry.dateKey)),
    [overrides],
  );

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const weeks = monthGrid(year, month);
  const isCurrentMonth = today.slice(0, 7) === monthKey;

  function showMonth(nextYear: number, nextMonth: number): void {
    setParams({ month: `${nextYear}-${String(nextMonth).padStart(2, '0')}` }, { replace: true });
  }

  function step(delta: number): void {
    const [nextYear, nextMonth] = shiftMonth(year, month, delta);
    showMonth(nextYear, nextMonth);
  }

  return (
    <div className="calendar">
      <div className="calendar__top">
        <h2 className="calendar__month">{formatMonth(year, month)}</h2>
        <div className="calendar__actions">
          <Button
            variant="secondary"
            className="calendar__nav"
            aria-label="Previous month"
            onClick={() => step(-1)}
          >
            <PrevIcon {...iconProps} />
          </Button>
          <Button
            variant="secondary"
            className="calendar__nav"
            aria-label="Next month"
            onClick={() => step(1)}
          >
            <NextIcon {...iconProps} />
          </Button>
          {isCurrentMonth ? null : (
            <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
              This month
            </Button>
          )}
        </div>
      </div>

      <div className="calendar__grid">
        {WEEKDAYS.map((label) => (
          <span key={label} className="calendar__weekday">
            {label}
          </span>
        ))}

        {weeks.flat().map((key) => {
          if (key.slice(0, 7) !== monthKey) {
            return <span key={key} className="calendar__cell calendar__cell--empty" />;
          }

          const holiday = holidayMap.get(key);
          const count = counts.get(key) ?? 0;
          const hasOverride = overrideSet.has(key);
          const classes = ['calendar__cell'];
          if (key === today) classes.push('calendar__cell--today');

          const label = [formatDateLong(key)];
          if (holiday) label.push(holiday);
          if (count > 0) label.push(`${count} tasks`);

          return (
            <button
              key={key}
              type="button"
              className={classes.join(' ')}
              aria-label={label.join(', ')}
              onClick={() => navigate(`/day/${key}`)}
            >
              <span className="calendar__day-num">{Number(key.slice(8, 10))}</span>
              {holiday ? (
                <span className="calendar__holiday" dir="auto" title={holiday}>
                  {shortName(holiday)}
                </span>
              ) : null}
              <span className="calendar__foot">
                {hasOverride ? (
                  <span className="calendar__override" title="Day type override" />
                ) : null}
                {count > 0 ? <span className="calendar__count">{count}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
