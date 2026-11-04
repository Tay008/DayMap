import type { Domain, Task } from '../../data/types';
import Button from './Button';
import Sheet from './Sheet';
import TaskRow from './TaskRow';
import './DayBacklog.css';

export interface BacklogEntry extends Task {
  ageDays: number;
}

interface DayBacklogProps {
  open: boolean;
  tasks: BacklogEntry[];
  isPast: boolean;
  domainOf: (task: Task) => Domain | undefined;
  onClose: () => void;
  onOpenTask: (task: Task) => void;
  onPlan: (task: Task) => void;
}

export default function DayBacklog({
  open,
  tasks,
  isPast,
  domainOf,
  onClose,
  onOpenTask,
  onPlan,
}: DayBacklogProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Backlog">
      {tasks.length === 0 ? (
        <div className="day-backlog__empty">
          <p>Nothing in the backlog.</p>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <div className="day-backlog">
          {tasks.map((task) => (
            <div key={task.id} className="day-backlog__row">
              <TaskRow
                task={task}
                domain={domainOf(task)}
                ageDays={task.ageDays}
                onOpen={() => onOpenTask(task)}
              />
              <Button variant="secondary" disabled={isPast} onClick={() => onPlan(task)}>
                Plan for this day
              </Button>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
