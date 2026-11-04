import { useState } from 'react';
import { deleteTask, logProgress, planTask, undoLastLog } from '../../data/repo';
import { doneAmount, fraction, halfAmount, isDone, progressOf, remaining } from '../../lib/progress';
import type { ResolvedZone } from '../../lib/templates';
import { addDays } from '../../lib/time';
import type { Domain, Log, Task } from '../../data/types';
import { useRecentLogs } from '../../hooks/useRecentLogs';
import { useToday } from '../../hooks/useToday';
import Button from './Button';
import ConfirmDialog from './ConfirmDialog';
import { TextField } from './Field';
import ProgressBar from './ProgressBar';
import Sheet from './Sheet';
import './TaskSheet.css';

const PRIORITY_LABELS: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' };

interface TaskSheetProps {
  uid: string;
  task: Task;
  domain?: Domain;
  rooms?: ResolvedZone[];
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function TaskSheet({
  uid,
  task,
  domain,
  rooms,
  open,
  onClose,
  onEdit,
}: TaskSheetProps) {
  const today = useToday();
  const logs = useRecentLogs(uid, addDays(today, -1));
  const [custom, setCustom] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState(task.plannedDate ?? '');

  let newest: Log | null = null;
  for (const log of logs) {
    if (log.taskId === task.id && (newest === null || log.at > newest.at)) newest = log;
  }
  const undoLog = newest;

  const done = isDone(task);
  const left = remaining(task);
  const canDone = left > 0;
  const canHalf = task.target >= 2 && left > 0;
  const customAmount = Number(custom);
  const canAddCustom = Number.isFinite(customAmount) && customAmount > 0;

  function addCustom(): void {
    if (!canAddCustom) return;
    logProgress(uid, task, customAmount);
    setCustom('');
  }

  function moveTo(zoneId: string | null): void {
    planTask(uid, task.id, task.plannedDate, zoneId);
    setMoveOpen(false);
  }

  function savePlan(dateKey: string | null): void {
    planTask(uid, task.id, dateKey, task.zoneId);
    setPlanOpen(false);
  }

  function confirmDelete(): void {
    deleteTask(uid, task.id);
    setConfirmOpen(false);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={task.title}>
      <div className="task-sheet">
        <p className="task-sheet__meta">
          {domain?.name ?? 'Task'} · {PRIORITY_LABELS[task.priority]} · {progressOf(task)} /{' '}
          {task.target} {task.unit}
          {done ? ' · complete' : ''}
        </p>
        <ProgressBar value={fraction(task)} />

        <div className="task-sheet__row">
          {canDone ? (
            <Button onClick={() => logProgress(uid, task, doneAmount(task))}>Done</Button>
          ) : null}
          {canHalf ? (
            <Button variant="secondary" onClick={() => logProgress(uid, task, halfAmount(task))}>
              Half
            </Button>
          ) : null}
          {undoLog ? (
            <Button variant="secondary" onClick={() => undoLastLog(uid, task, undoLog)}>
              Undo last
            </Button>
          ) : null}
        </div>

        <div className="task-sheet__custom">
          <TextField
            id="task-custom"
            label="Custom amount"
            type="number"
            min={1}
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
          />
          <Button variant="secondary" disabled={!canAddCustom} onClick={addCustom}>
            Add
          </Button>
        </div>

        {task.kind === 'one_off' ? (
          <>
            {rooms && task.plannedDate !== null ? (
              <div className="task-sheet__section">
                <Button variant="secondary" onClick={() => setMoveOpen((current) => !current)}>
                  Move to another room
                </Button>
                {moveOpen ? (
                  <div className="task-sheet__options">
                    <Button variant="secondary" onClick={() => moveTo(null)}>
                      No room
                    </Button>
                    {rooms
                      .filter((room) => room.kind === 'open')
                      .map((room) => (
                        <Button
                          key={room.id}
                          variant={task.zoneId === room.id ? 'primary' : 'secondary'}
                          onClick={() => moveTo(room.id)}
                        >
                          {room.name}
                        </Button>
                      ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="task-sheet__section">
              <Button variant="secondary" onClick={() => setPlanOpen((current) => !current)}>
                Plan for another day
              </Button>
              {planOpen ? (
                <div className="task-sheet__plan">
                  <TextField
                    id="task-plan-date"
                    label="New date"
                    type="date"
                    value={planDate}
                    onChange={(event) => setPlanDate(event.target.value)}
                  />
                  <div className="task-sheet__row">
                    <Button onClick={() => savePlan(planDate === '' ? null : planDate)}>
                      Plan
                    </Button>
                    {task.plannedDate !== null ? (
                      <Button variant="secondary" onClick={() => savePlan(null)}>
                        Unplan
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="task-sheet__row">
          <Button variant="secondary" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this task?"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Sheet>
  );
}
