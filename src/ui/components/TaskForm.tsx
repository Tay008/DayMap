import { useState } from 'react';
import { createTask, updateTask } from '../../data/repo';
import type { TaskInput } from '../../data/repo';
import type { Domain, Priority, Task } from '../../data/types';
import { useDayTemplate } from '../../hooks/useDayTemplate';
import Button from './Button';
import Chip from './Chip';
import { SelectField, TextField, TextareaField } from './Field';
import './TaskForm.css';

const UNITS = [
  { value: 'check', label: 'Check' },
  { value: '%', label: '%' },
  { value: 'items', label: 'Items' },
  { value: 'pages', label: 'Pages' },
  { value: 'min', label: 'Minutes' },
  { value: 'ml', label: 'ml' },
  { value: 'custom', label: 'Custom' },
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 1, label: 'High' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Low' },
];

const isPresetUnit = (unit: string): boolean => UNITS.some((entry) => entry.value === unit);

interface TaskFormProps {
  uid: string;
  domains: Domain[];
  task?: Task | null;
  defaultDate?: string | null;
  defaultZoneId?: string | null;
  onClose: () => void;
}

export default function TaskForm({
  uid,
  domains,
  task = null,
  defaultDate = null,
  defaultZoneId = null,
  onClose,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [domainId, setDomainId] = useState(task?.domainId ?? domains[0]?.id ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 2);
  const [target, setTarget] = useState(String(task?.target ?? 1));
  const [unitChoice, setUnitChoice] = useState(
    task && !isPresetUnit(task.unit) ? 'custom' : (task?.unit ?? 'check'),
  );
  const [customUnit, setCustomUnit] = useState(
    task && !isPresetUnit(task.unit) ? task.unit : '',
  );
  const [plannedDate, setPlannedDate] = useState(
    task?.plannedDate ?? defaultDate ?? '',
  );
  const [zoneId, setZoneId] = useState<string | null>(task?.zoneId ?? defaultZoneId ?? null);
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [errors, setErrors] = useState<{ title?: string; target?: string; unit?: string }>({});

  const template = useDayTemplate(uid, plannedDate === '' ? null : plannedDate);
  const openRooms = template?.rooms.filter((room) => room.kind === 'open') ?? [];

  function submit(): void {
    const nextErrors: typeof errors = {};
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 120) {
      nextErrors.title = 'Title must be 1 to 120 characters';
    }
    const targetNumber = Number(target);
    if (!Number.isFinite(targetNumber) || targetNumber <= 0) {
      nextErrors.target = 'Enter a number above 0';
    }
    const unit = unitChoice === 'custom' ? customUnit.trim() : unitChoice;
    if (unitChoice === 'custom' && (unit.length < 1 || unit.length > 12)) {
      nextErrors.unit = 'Custom unit must be 1 to 12 characters';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: TaskInput = {
      title: trimmedTitle,
      domainId,
      priority,
      kind: task?.kind ?? 'one_off',
      target: targetNumber,
      unit,
      plannedDate: plannedDate === '' ? null : plannedDate,
      zoneId,
      notes: notes.trim(),
      habitId: task?.habitId ?? null,
    };

    if (task) updateTask(uid, task, input);
    else createTask(uid, input);
    onClose();
  }

  return (
    <div className="task-form">
      <TextField
        id="task-title"
        label="Title"
        value={title}
        error={errors.title}
        maxLength={120}
        onChange={(event) => setTitle(event.target.value)}
      />

      <div className="task-form__group">
        <span className="task-form__label">Domain</span>
        <div className="task-form__chips">
          {domains.map((domain) => (
            <Chip
              key={domain.id}
              selected={domain.id === domainId}
              onClick={() => setDomainId(domain.id)}
            >
              {domain.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className="task-form__group">
        <span className="task-form__label">Priority</span>
        <div className="task-form__chips">
          {PRIORITIES.map((entry) => (
            <Chip
              key={entry.value}
              selected={entry.value === priority}
              onClick={() => setPriority(entry.value)}
            >
              {entry.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="task-form__group">
        <span className="task-form__label">How much counts as done?</span>
        <div className="task-form__target">
          <TextField
            id="task-target"
            label="Target"
            type="number"
            min={1}
            value={target}
            error={errors.target}
            onChange={(event) => setTarget(event.target.value)}
          />
          <SelectField
            id="task-unit"
            label="Unit"
            value={unitChoice}
            onChange={(event) => setUnitChoice(event.target.value)}
          >
            {UNITS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </SelectField>
        </div>
        {unitChoice === 'custom' ? (
          <TextField
            id="task-custom-unit"
            label="Custom unit"
            maxLength={12}
            value={customUnit}
            error={errors.unit}
            onChange={(event) => setCustomUnit(event.target.value)}
          />
        ) : null}
      </div>

      <TextField
        id="task-date"
        label="Planned date"
        type="date"
        value={plannedDate}
        onChange={(event) => setPlannedDate(event.target.value)}
      />

      <div className="task-form__group">
        <span className="task-form__label">Room</span>
        {plannedDate === '' ? (
          <p className="task-form__hint">Choose a date first.</p>
        ) : openRooms.length === 0 ? (
          <p className="task-form__hint">No open rooms on this day.</p>
        ) : (
          <div className="task-form__chips">
            <Chip selected={zoneId === null} onClick={() => setZoneId(null)}>
              No room
            </Chip>
            {openRooms.map((room) => (
              <Chip key={room.id} selected={zoneId === room.id} onClick={() => setZoneId(room.id)}>
                {room.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <TextareaField
        id="task-notes"
        label="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      <div className="task-form__actions">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          {task ? 'Save' : 'Add task'}
        </Button>
      </div>
    </div>
  );
}
