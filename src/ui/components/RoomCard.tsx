import { useDroppable } from '@dnd-kit/core';
import type { Domain, Task } from '../../data/types';
import { formatMinutes } from '../../lib/time';
import type { ResolvedZone } from '../../lib/templates';
import { iconFor, iconProps } from '../icons';
import DraggableTaskRow from './DraggableTaskRow';
import NowTag from './NowTag';
import './RoomCard.css';

interface RoomCardProps {
  zone: ResolvedZone;
  tasks: Task[];
  domainOf: (task: Task) => Domain | undefined;
  isNow: boolean;
  isPast: boolean;
  onOpenTask: (task: Task) => void;
  onAddTask: () => void;
}

export default function RoomCard({
  zone,
  tasks,
  domainOf,
  isNow,
  isPast,
  onOpenTask,
  onAddTask,
}: RoomCardProps) {
  const sealed = zone.kind !== 'open';
  const { setNodeRef, isOver } = useDroppable({
    id: zone.id,
    data: { zoneId: zone.id },
    disabled: sealed || isPast,
  });
  const classes = [
    'room',
    sealed ? 'room--sealed' : 'room--open',
    isNow ? 'room--now' : '',
    isOver ? 'room--over' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const timeRange = `${formatMinutes(zone.startMin)} – ${formatMinutes(zone.endMin)}`;
  const Icon = sealed ? iconFor(zone.kind) : null;

  return (
    <section
      ref={sealed || isPast ? undefined : setNodeRef}
      className={classes}
      aria-label={zone.name}
    >
      <div className="room__header">
        <span className="room__name">{zone.name}</span>
        {isNow ? <NowTag /> : null}
        <span className="room__time">{timeRange}</span>
      </div>

      {sealed ? (
        <div className="room__sealed">{Icon ? <Icon {...iconProps} /> : null}</div>
      ) : (
        <>
          {tasks.map((task) => (
            <DraggableTaskRow
              key={task.id}
              task={task}
              domain={domainOf(task)}
              disabled={isPast}
              onOpen={() => onOpenTask(task)}
            />
          ))}
          <button type="button" className="room__add" onClick={onAddTask} disabled={isPast}>
            {isPast ? 'This day is over' : 'Add task'}
          </button>
        </>
      )}
    </section>
  );
}
