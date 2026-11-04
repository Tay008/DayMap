import type { CSSProperties } from 'react';
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { fraction, isDone, remaining } from '../../lib/progress';
import type { Domain, Task } from '../../data/types';
import ProgressRing from './ProgressRing';
import './TaskRow.css';

interface TaskRowProps {
  task: Task;
  domain?: Domain;
  ageDays?: number;
  onOpen: () => void;
  dragRef?: (node: HTMLElement | null) => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: DraggableSyntheticListeners;
  dragging?: boolean;
  style?: CSSProperties;
}

export default function TaskRow({
  task,
  domain,
  ageDays,
  onOpen,
  dragRef,
  dragAttributes,
  dragListeners,
  dragging = false,
  style,
}: TaskRowProps) {
  const done = isDone(task);
  const left = remaining(task);
  const name = domain?.name ?? 'Task';
  const meta = done
    ? `${name} · done`
    : ageDays !== undefined
      ? `${name} · ${left} of ${task.target} left · ${ageDays} days old`
      : `${name} · ${left} left`;

  const classes = ['task-row'];
  if (dragRef) classes.push('task-row--draggable');
  if (dragging) classes.push('task-row--dragging');

  return (
    <button
      ref={dragRef}
      type="button"
      className={classes.join(' ')}
      style={style}
      {...dragAttributes}
      {...dragListeners}
      onClick={onOpen}
    >
      <span
        className={`task-row__bar task-row__bar--${task.priority}`}
        style={domain ? { background: `var(--domain-${domain.colorIndex})` } : undefined}
      />
      <span className="task-row__body">
        <span
          className={done ? 'task-row__title task-row__title--done' : 'task-row__title'}
          dir="auto"
        >
          {task.title}
        </span>
        <span className="task-row__meta">{meta}</span>
      </span>
      <ProgressRing value={fraction(task)} done={done} />
    </button>
  );
}
