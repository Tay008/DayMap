import { useState } from 'react';
import { deleteHoliday, saveHoliday } from '../data/repo';
import type { Holiday } from '../data/types';
import { formatDateLong } from '../lib/time';
import { useAuth } from '../hooks/useAuth';
import { useHolidays } from '../hooks/useHolidays';
import Button from '../ui/components/Button';
import ConfirmDialog from '../ui/components/ConfirmDialog';
import { TextField } from '../ui/components/Field';
import Sheet from '../ui/components/Sheet';
import './Holidays.css';

export default function Holidays() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const holidays = useHolidays(uid);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Holiday | null>(null);
  const [dateKey, setDateKey] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const sorted = [...holidays].sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  function openNew(): void {
    setDateKey('');
    setName('');
    setError('');
    setFormOpen(true);
  }

  function submit(): void {
    if (!uid) return;
    const trimmed = name.trim();
    if (dateKey === '') {
      setError('Pick a date');
      return;
    }
    if (trimmed.length < 1 || trimmed.length > 60) {
      setError('Name must be 1 to 60 characters');
      return;
    }
    saveHoliday(uid, { id: crypto.randomUUID(), dateKey, name: trimmed });
    setFormOpen(false);
  }

  return (
    <div>
      <div className="holidays__top">
        <Button onClick={openNew}>Add holiday</Button>
      </div>

      {sorted.length === 0 ? (
        <div className="holidays__empty">
          <p>No holidays yet.</p>
          <Button variant="secondary" onClick={openNew}>
            Add holiday
          </Button>
        </div>
      ) : (
        <ul className="holidays__list">
          {sorted.map((holiday) => (
            <li key={holiday.id} className="holiday-item">
              <div className="holiday-item__body">
                <span className="holiday-item__name" dir="auto">
                  {holiday.name}
                </span>
                <span className="holiday-item__date">{formatDateLong(holiday.dateKey)}</span>
              </div>
              <Button variant="danger" onClick={() => setDeleting(holiday)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}

      {uid && formOpen ? (
        <Sheet open onClose={() => setFormOpen(false)} title="New holiday">
          <div className="holiday-form">
            <TextField
              id="holiday-name"
              label="Name"
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              id="holiday-date"
              label="Date"
              type="date"
              value={dateKey}
              onChange={(event) => setDateKey(event.target.value)}
            />
            {error !== '' ? <p className="holiday-form__error">{error}</p> : null}
            <div className="holiday-form__actions">
              <Button variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={submit}>
                Add holiday
              </Button>
            </div>
          </div>
        </Sheet>
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this holiday?"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (uid && deleting) deleteHoliday(uid, deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
