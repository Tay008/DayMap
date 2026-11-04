import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ensureHabitInstances, planTask } from '../data/repo';
import type { Domain, Task } from '../data/types';
import { backlogOf } from '../lib/progress';
import { nextPrayer, PRAYER_ORDER, prayerTimesMs } from '../lib/prayer';
import { addDays, minutesOfDay, type DateKey } from '../lib/time';
import { useAuth } from '../hooks/useAuth';
import { useDay } from '../hooks/useDay';
import { useDomains } from '../hooks/useDomains';
import { useHabits } from '../hooks/useHabits';
import { useNowMs } from '../hooks/useNowMs';
import { useOpenOneOffs } from '../hooks/useOpenOneOffs';
import { useSettings } from '../hooks/useSettings';
import { useToday } from '../hooks/useToday';
import Button from '../ui/components/Button';
import DailyGoals from '../ui/components/DailyGoals';
import DayBacklog from '../ui/components/DayBacklog';
import DayDnd from '../ui/components/DayDnd';
import DayHeader from '../ui/components/DayHeader';
import DayMap from '../ui/components/DayMap';
import DayTypeMenu from '../ui/components/DayTypeMenu';
import DayTray from '../ui/components/DayTray';
import PrayerStrip from '../ui/components/PrayerStrip';
import ProgressBar from '../ui/components/ProgressBar';
import RoomPicker from '../ui/components/RoomPicker';
import Sheet from '../ui/components/Sheet';
import TaskForm from '../ui/components/TaskForm';
import TaskSheet from '../ui/components/TaskSheet';
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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formZone, setFormZone] = useState<string | null>(null);
  const [pickerTask, setPickerTask] = useState<Task | null>(null);
  const [backlogOpen, setBacklogOpen] = useState(false);

  useEffect(() => {
    if (uid && habits.length > 0 && dateKey >= today) ensureHabitInstances(uid, dateKey, habits);
  }, [uid, dateKey, today, habits]);

  if (!day) return <p className="day__loading">Loading day…</p>;

  const tasks = day.tasks;
  const selected = selectedId
    ? ([...tasks, ...openOneOffs].find((task) => task.id === selectedId) ?? null)
    : null;
  const goals = tasks.filter((task) => task.kind === 'daily_goal');
  const unplaced = day.unplaced.filter((task) => task.kind !== 'daily_goal');
  const backlog = backlogOf(openOneOffs, dateKey);
  const openRooms = day.rooms.filter((room) => room.kind === 'open');
  const nowMin = minutesOfDay(now);

  const tomorrow = settings
    ? prayerTimesMs(addDays(dateKey, 1), settings.lat, settings.lng, settings.adjust)
    : undefined;
  const next = isToday ? nextPrayer(now, day.prayers, tomorrow) : null;

  const markers = PRAYER_ORDER.map((name) => ({ name, minute: day.prayerMin[name] })).sort(
    (a, b) => a.minute - b.minute,
  );

  function domainOf(task: Task): Domain | undefined {
    return domains.find((domain) => domain.id === task.domainId);
  }

  function go(key: DateKey): void {
    navigate(key === today ? '/' : `/day/${key}`);
  }

  function openNewTask(zoneId: string | null): void {
    setEditing(null);
    setFormZone(zoneId);
    setFormOpen(true);
  }

  function placeTask(zoneId: string | null): void {
    if (uid && pickerTask) planTask(uid, pickerTask.id, dateKey, zoneId);
    setPickerTask(null);
  }

  function handleDrop(taskId: string, zoneId: string | null): void {
    if (uid && !isPast) planTask(uid, taskId, dateKey, zoneId);
  }

  return (
    <DayDnd disabled={isPast} onDrop={handleDrop}>
      <div className="day">
        <DayHeader
          dateKey={dateKey}
          isToday={isToday}
          onPrev={() => go(addDays(dateKey, -1))}
          onNext={() => go(addDays(dateKey, 1))}
          onToday={() => go(today)}
        />

        {uid ? (
          <DayTypeMenu
            uid={uid}
            dateKey={dateKey}
            override={day.override}
            ramadan={day.ramadan}
          />
        ) : null}

        <PrayerStrip prayers={day.prayers} next={next} now={now} />

        {day.progress ? (
          <div className="day__progress">
            <p className="day__progress-text">
              {day.progress.done} of {day.progress.total} done, {day.progress.percent}%
            </p>
            <ProgressBar value={day.progress.percent / 100} label="Day progress" />
          </div>
        ) : null}

        {uid ? (
          <DailyGoals
            uid={uid}
            goals={goals}
            habits={habits}
            onOpenTask={(task) => setSelectedId(task.id)}
            onManage={() => navigate('/more/habits')}
          />
        ) : null}

        <DayTray
          tasks={unplaced}
          domainOf={domainOf}
          isPast={isPast}
          onOpenTask={(task) => setSelectedId(task.id)}
          onPlace={(task) => setPickerTask(task)}
        />

        <DayMap
          rooms={day.rooms}
          tasksByRoom={day.tasksByRoom}
          markers={markers}
          domainOf={domainOf}
          isToday={isToday}
          nowMin={nowMin}
          isPast={isPast}
          onOpenTask={(task) => setSelectedId(task.id)}
          onAddTask={openNewTask}
        />

        <div className="day__footer">
          <Button variant="secondary" onClick={() => setBacklogOpen(true)}>
            Backlog ({backlog.length})
          </Button>
        </div>

        <DayBacklog
          open={backlogOpen}
          tasks={backlog}
          isPast={isPast}
          domainOf={domainOf}
          onClose={() => setBacklogOpen(false)}
          onOpenTask={(task) => {
            setBacklogOpen(false);
            setSelectedId(task.id);
          }}
          onPlan={(task) => {
            setBacklogOpen(false);
            setPickerTask(task);
          }}
        />

        {uid ? (
          <RoomPicker
            open={pickerTask !== null}
            title="Place task"
            rooms={day.rooms}
            onPick={placeTask}
            onClose={() => setPickerTask(null)}
          />
        ) : null}

        {uid && selected ? (
          <TaskSheet
            uid={uid}
            task={selected}
            domain={domainOf(selected)}
            rooms={selected.plannedDate === dateKey ? openRooms : undefined}
            open
            onClose={() => setSelectedId(null)}
            onEdit={() => {
              setEditing(selected);
              setSelectedId(null);
              setFormOpen(true);
            }}
          />
        ) : null}

        {uid && formOpen ? (
          <Sheet
            open
            onClose={() => setFormOpen(false)}
            title={editing ? 'Edit task' : 'New task'}
          >
            <TaskForm
              uid={uid}
              domains={domains}
              task={editing}
              defaultDate={dateKey}
              defaultZoneId={formZone}
              onClose={() => setFormOpen(false)}
            />
          </Sheet>
        ) : null}
      </div>
    </DayDnd>
  );
}
