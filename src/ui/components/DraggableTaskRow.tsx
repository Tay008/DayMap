import { useDraggable } from '@dnd-kit/core';
import type { Domain, Task } from '../../data/types';
import TaskRow from './TaskRow';

interface DraggableTaskRowProps {
  task: Task;
  domain?: Domain;
  ageDays?: number;
  disabled?: boolean;
  onOpen: () => void;
}

export default function DraggableTaskRow({
  task,
  domain,
  ageDays,
  disabled = false,
  onOpen,
}: DraggableTaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { taskId: task.id },
    disabled,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 }
    : undefined;

  return (
    <TaskRow
      task={task}
      domain={domain}
      ageDays={ageDays}
      onOpen={onOpen}
      dragRef={setNodeRef}
      dragAttributes={attributes}
      dragListeners={listeners}
      dragging={isDragging}
      style={style}
    />
  );
}
