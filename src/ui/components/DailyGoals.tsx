import { logProgress } from '../../data/repo';
import { doneAmount, fraction, progressOf } from '../../lib/progress';
import type { Habit, Task } from '../../data/types';
import Button from './Button';
import ProgressBar from './ProgressBar';
import './DailyGoals.css';

interface DailyGoalsProps {
  uid: string;
  goals: Task[];
  habits: Habit[];
  onOpenTask: (task: Task) => void;
  onManage?: () => void;
}

export default function DailyGoals({
  uid,
  goals,
  habits,
  onOpenTask,
  onManage,
}: DailyGoalsProps) {
  if (goals.length === 0) {
    return (
      <div className="daily-goals__empty">
        <p>No daily goals for this day.</p>
        {onManage ? (
          <Button variant="secondary" onClick={onManage}>
            Habits
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="daily-goals">
      {goals.map((task) => {
        const habit = habits.find((entry) => entry.id === task.habitId);
        const quickAdds = habit?.quickAdds ?? [];
        const left = doneAmount(task);

        return (
          <div
            key={task.id}
            className="daily-goal"
            role="button"
            tabIndex={0}
            onClick={() => onOpenTask(task)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onOpenTask(task);
            }}
          >
            <span className="daily-goal__title" dir="auto">
              {task.title}
            </span>
            <ProgressBar value={fraction(task)} label={task.title} />
            <span className="daily-goal__amount">
              {progressOf(task)} / {task.target} {task.unit}
            </span>
            <div className="daily-goal__actions">
              {quickAdds.map((amount) => (
                <Button
                  key={amount}
                  variant="secondary"
                  onClick={(event) => {
                    event.stopPropagation();
                    logProgress(uid, task, amount);
                  }}
                >
                  +{amount}
                </Button>
              ))}
              {left > 0 ? (
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    logProgress(uid, task, left);
                  }}
                >
                  Done
                </Button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
