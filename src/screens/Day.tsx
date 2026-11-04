import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ensureHabitInstances } from '../data/repo';
import type { Task } from '../data/types';
import { backlogOf } from '../lib/progress';
import { prayerTimesMs } from '../lib/prayer';
import { addDays, type DateKey } from '../lib/time';
import { buildTodayView } from '../lib/todayView';
import { useAuth } from '../hooks/useAuth';
import { useDay } from '../hooks/useDay';
import { useDomains } from '../hooks/useDomains';
import { useHabits } from '../hooks/useHabits';
import { useNowMs } from '../hooks/useNowMs';
import { useOpenOneOffs } from '../hooks/useOpenOneOffs';
import { useSettings } from '../hooks/useSettings';
import { useToday } from '../hooks/useToday';
import DayBacklog from '../ui/components/DayBacklog';
import DayTypeMenu from '../ui/components/DayTypeMenu';
import TodayScreen from '../ui/today/TodayScreen';
import HabitCard from '../ui/today/HabitCard';
import './Day.css';

export default function Day() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const params = useParams<{ dateKey?: string }>();
  const today = useToday();
  const navigate = useNavigate();
  const dateKey = params.dateKey ?? today;
  const isToday = dateKey === today;
  const isPast = dateKey < today;
  const now = useNowMs();

  const day = useDay(dateKey);
  const domains = useDomains(uid);
  const habits = useHabits(uid);
  const settings = useSettings(uid);
  const openOneOffs = useOpenOneOffs(uid);

  useEffect(() => {
    if (uid && habits.length > 0 && dateKey >= today) ensureHabitInstances(uid, dateKey, habits);
  }, [uid, dateKey, today, habits]);

  if (!day) return <p className="day__loading">Loading day…</p>;

  const tasks = day.tasks;
  const goals = tasks.filter((task) => task.kind === 'daily_goal');
  const unplaced = day.unplaced.filter((task) => task.kind !== 'daily_goal');
  const backlog = backlogOf(openOneOffs, dateKey);

  function domainOf(task: Task) {
    return domains.find((domain) => domain.id === task.domainId);
  }

  function go(key: DateKey): void {
    navigate(key === today ? '/' : `/day/${key}`);
  }

  const tomorrowPrayers = settings
    ? prayerTimesMs(addDays(dateKey, 1), settings.lat, settings.lng, settings.adjust)
    : undefined;

  const taskCountByRoom: Record<string, number> = {};
  for (const room of day.rooms) {
    taskCountByRoom[room.id] = (day.tasksByRoom[room.id] ?? []).length;
  }

  const view = buildTodayView({
    now,
    dateKey,
    isToday,
    prayerMin: day.prayerMin,
    prayerMs: day.prayers,
    tomorrowPrayerMs: tomorrowPrayers,
    blocks: day.rooms,
    taskCountByRoom,
  });

  const controls = uid ? (
    <DayTypeMenu uid={uid} dateKey={dateKey} override={day.override} ramadan={day.ramadan} />
  ) : null;

  const renderRoomBody = (roomId: string) => {
    const roomTasks = day.tasksByRoom[roomId] ?? [];
    return (
      <>
        {roomTasks.map((task) => (
          <label key={task.id} className="dm-tk">
            <input type="checkbox" readOnly checked={!!task.doneAt} />
            {task.title}
          </label>
        ))}
      </>
    );
  };

  const unplacedEl = unplaced.length > 0 ? (
    <section className="dm-tl" style={{ marginTop: '8px' }}>
      {unplaced.map((task) => (
        <div key={task.id} className="dm-row">
          <div className="dm-t"></div>
          <label className="dm-tk">
            <input type="checkbox" readOnly checked={!!task.doneAt} />
            {task.title}
          </label>
        </div>
      ))}
    </section>
  ) : null;

  const rightColumn = (
    <>
      {uid
        ? goals.map((task) => (
            <HabitCard key={task.id} uid={uid} task={task} habit={habits.find((h) => h.id === task.habitId)} />
          ))
        : null}
      <DayBacklog
        open={false}
        tasks={backlog}
        isPast={isPast}
        domainOf={domainOf}
        onClose={() => {}}
        onOpenTask={() => {}}
        onPlan={() => {}}
      />
    </>
  );

  return (
    <TodayScreen
      view={view}
      onPrev={() => go(addDays(dateKey, -1))}
      onNext={() => go(addDays(dateKey, 1))}
      controls={controls}
      renderRoomBody={renderRoomBody}
      unplaced={unplacedEl}
      rightColumn={rightColumn}
      progressDone={day.progress?.done ?? 0}
      progressPlanned={day.progress?.total ?? 0}
    />
  );
}
