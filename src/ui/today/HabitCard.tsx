import type { Habit, Task } from '../../data/types';
import { doneAmount, progressOf } from '../../lib/progress';
import { logProgress } from '../../data/repo';
import SegBar from '../charts/SegBar';
import '../../styles/dm-today.css';

interface HabitCardProps {
  uid: string;
  task: Task;
  habit?: Habit;
}

export default function HabitCard({ uid, task, habit }: HabitCardProps) {
  const quickAdds = habit?.quickAdds ?? [];
  const left = doneAmount(task);
  const current = progressOf(task);
  const target = task.target;
  const step = quickAdds.length > 0 && target / Math.min(...quickAdds) <= 20 ? Math.min(...quickAdds) : target / 10;
  const total = Math.max(1, Math.round(target / (step > 0 ? step : target)));
  const filled = Math.floor(current / (step > 0 ? step : 1));

  return (
    <section className="dm-card dm-rc">
      <h3 className="dm-rt">{task.title}</h3>
      <p className="dm-sub">
        {current} of {target} {task.unit}
      </p>
      <SegBar filled={filled} total={total} label={`${current} of ${target} ${task.unit}`} />
      <div className="dm-bts">
        {quickAdds.map((amount) => (
          <button
            key={amount}
            className="dm-btn"
            onClick={() => logProgress(uid, task, amount)}
            type="button"
          >
            +{amount}
          </button>
        ))}
        {left > 0 ? (
          <button className="dm-btn dm-ink" onClick={() => logProgress(uid, task, left)} type="button">
            Done
          </button>
        ) : null}
      </div>
    </section>
  );
}
