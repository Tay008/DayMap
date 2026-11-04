import { useDroppable } from '@dnd-kit/core';
import type { Domain, Task } from '../../data/types';
import Button from './Button';
import DraggableTaskRow from './DraggableTaskRow';
import './DayTray.css';

interface DayTrayProps {
  tasks: Task[];
  domainOf: (task: Task) => Domain | undefined;
  isPast: boolean;
  onOpenTask: (task: Task) => void;
  onPlace: (task: Task) => void;
}

export default function DayTray({ tasks, domainOf, isPast, onOpenTask, onPlace }: DayTrayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unplaced',
    data: { zoneId: null },
    disabled: isPast,
  });

  if (tasks.length === 0) return null;

  const classes = ['day-tray'];
  if (isOver) classes.push('day-tray--over');

  return (
    <section ref={isPast ? undefined : setNodeRef} className={classes.join(' ')}>
      <h3 className="day-tray__title">Not in a room yet</h3>
      <div className="day-tray__list">
        {tasks.map((task) => (
          <div key={task.id} className="day-tray__row">
            <DraggableTaskRow
              task={task}
              domain={domainOf(task)}
              disabled={isPast}
              onOpen={() => onOpenTask(task)}
            />
            <Button variant="secondary" disabled={isPast} onClick={() => onPlace(task)}>
              Place
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
