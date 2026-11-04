import { useState } from 'react';
import { createCounter } from '../../data/counterRepo';
import type { DateKey } from '../../lib/time';
import Button from './Button';
import Chip from './Chip';
import { TextField } from './Field';
import './CounterForm.css';

interface CounterFormProps {
  uid: string;
  today: DateKey;
  onClose: () => void;
}

export default function CounterForm({ uid, today, onClose }: CounterFormProps) {
  const [label, setLabel] = useState('Streak');
  const [startDate, setStartDate] = useState(today);
  const [localOnly, setLocalOnly] = useState(true);
  const [error, setError] = useState('');

  function submit(): void {
    const trimmed = label.trim();
    if (trimmed.length < 1 || trimmed.length > 40) {
      setError('Label must be 1 to 40 characters');
      return;
    }
    if (startDate === '') {
      setError('Pick a start date');
      return;
    }
    if (startDate > today) {
      setError('Start date cannot be in the future');
      return;
    }
    createCounter(uid, { label: trimmed, startDateKey: startDate, localOnly });
    onClose();
  }

  return (
    <div className="counter-form">
      <TextField
        id="counter-label"
        label="Label"
        value={label}
        maxLength={40}
        onChange={(event) => setLabel(event.target.value)}
      />
      <TextField
        id="counter-start"
        label="Start date"
        type="date"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
      />

      <div className="counter-form__group">
        <span className="counter-form__label">Where to keep it</span>
        <div className="counter-form__chips">
          <Chip selected={localOnly} onClick={() => setLocalOnly(true)}>
            This device only (recommended)
          </Chip>
          <Chip selected={!localOnly} onClick={() => setLocalOnly(false)}>
            Sync across devices
          </Chip>
        </div>
        {!localOnly ? (
          <p className="counter-form__note">
            Synced data is stored on Google&apos;s servers under your account.
          </p>
        ) : null}
      </div>

      {error !== '' ? <p className="counter-form__error">{error}</p> : null}

      <div className="counter-form__actions">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit}>Start a counter</Button>
      </div>
    </div>
  );
}
