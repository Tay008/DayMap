import { useState } from 'react';
import { saveHabit } from '../../data/repo';
import type { Domain, Habit, Priority } from '../../data/types';
import Button from './Button';
import Chip from './Chip';
import { SelectField, TextField } from './Field';
import './HabitForm.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

interface HabitFormProps {
  uid: string;
  domains: Domain[];
  habit?: Habit | null;
  onClose: () => void;
}

export default function HabitForm({ uid, domains, habit = null, onClose }: HabitFormProps) {
  const [title, setTitle] = useState(habit?.title ?? '');
  const [domainId, setDomainId] = useState(habit?.domainId ?? domains[0]?.id ?? '');
  const [priority, setPriority] = useState<Priority>(habit?.priority ?? 2);
  const [target, setTarget] = useState(String(habit?.target ?? 1));
  const [unitChoice, setUnitChoice] = useState(
    habit && !isPresetUnit(habit.unit) ? 'custom' : (habit?.unit ?? 'check'),
  );
  const [customUnit, setCustomUnit] = useState(
    habit && !isPresetUnit(habit.unit) ? habit.unit : '',
  );
  const [days, setDays] = useState<number[]>(habit?.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]);
  const [quickAdds, setQuickAdds] = useState((habit?.quickAdds ?? []).join(', '));
  const [errors, setErrors] = useState<{ title?: string; target?: string; unit?: string; days?: string }>({});

  function toggleDay(day: number): void {
    setDays((current) =>
      current.includes(day)
        ? current.filter((entry) => entry !== day)
        : [...current, day].sort((a, b) => a - b),
    );
  }

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
    if (days.length === 0) nextErrors.days = 'Pick at least one day';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const quickAddNumbers = quickAdds
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .map(Number)
      .filter((value) => Number.isFinite(value) && value > 0);

    const now = Date.now();
    const saved: Habit = {
      id: habit?.id ?? crypto.randomUUID(),
      title: trimmedTitle,
      domainId,
      priority,
      target: targetNumber,
      unit,
      daysOfWeek: days,
      quickAdds: quickAddNumbers,
      active: habit?.active ?? true,
      createdAt: habit?.createdAt ?? now,
      updatedAt: now,
    };
    saveHabit(uid, saved);
    onClose();
  }

  return (
    <div className="habit-form">
      <TextField
        id="habit-title"
        label="Title"
        value={title}
        error={errors.title}
        maxLength={120}
        onChange={(event) => setTitle(event.target.value)}
      />

      <div className="habit-form__group">
        <span className="habit-form__label">Domain</span>
        <div className="habit-form__chips">
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

      <div className="habit-form__group">
        <span className="habit-form__label">Priority</span>
        <div className="habit-form__chips">
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

      <div className="habit-form__group">
        <span className="habit-form__label">Daily target</span>
        <div className="habit-form__target">
          <TextField
            id="habit-target"
            label="Target"
            type="number"
            min={1}
            value={target}
            error={errors.target}
            onChange={(event) => setTarget(event.target.value)}
          />
          <SelectField
            id="habit-unit"
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
            id="habit-custom-unit"
            label="Custom unit"
            maxLength={12}
            value={customUnit}
            error={errors.unit}
            onChange={(event) => setCustomUnit(event.target.value)}
          />
        ) : null}
      </div>

      <div className="habit-form__group">
        <span className="habit-form__label">Days</span>
        <div className="habit-form__chips">
          {WEEKDAYS.map((label, index) => (
            <Chip key={label} selected={days.includes(index)} onClick={() => toggleDay(index)}>
              {label}
            </Chip>
          ))}
        </div>
        {errors.days ? <p className="habit-form__error">{errors.days}</p> : null}
      </div>

      <TextField
        id="habit-quick-adds"
        label="Quick-add amounts (comma separated)"
        placeholder="250, 500"
        value={quickAdds}
        onChange={(event) => setQuickAdds(event.target.value)}
      />

      <div className="habit-form__actions">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          {habit ? 'Save' : 'Add habit'}
        </Button>
      </div>
    </div>
  );
}
