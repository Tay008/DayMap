import type { ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

interface DayDndProps {
  disabled: boolean;
  onDrop: (taskId: string, zoneId: string | null) => void;
  children: ReactNode;
}

function zoneIdOf(event: DragEndEvent): string | null | undefined {
  const data = event.over?.data.current;
  if (data === undefined || data === null) return undefined;
  const value = data.zoneId;
  if (value === null || typeof value === 'string') return value;
  return undefined;
}

export default function DayDnd({ disabled, onDrop, children }: DayDndProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(event: DragEndEvent): void {
    if (disabled || event.over === null) return;
    const zoneId = zoneIdOf(event);
    if (zoneId === undefined) return;
    onDrop(String(event.active.id), zoneId);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
