import { useState } from 'react';
import { deleteHabit, setHabitActive } from '../data/repo';
import type { Habit } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { useDomains } from '../hooks/useDomains';
import { useHabits } from '../hooks/useHabits';
import Button from '../ui/components/Button';
import ConfirmDialog from '../ui/components/ConfirmDialog';
import HabitForm from '../ui/components/HabitForm';
import Sheet from '../ui/components/Sheet';
import './Habits.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Habits() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const habits = useHabits(uid);
  const domains = useDomains(uid);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [deleting, setDeleting] = useState<Habit | null>(null);

  function openNew(): void {
    setEditing(null);
    setFormOpen(true);
  }

  function toggleActive(habit: Habit): void {
    if (!uid) return;
    setHabitActive(uid, habit, !habit.active);
  }

  function domainName(id: string): string {
    return domains.find((domain) => domain.id === id)?.name ?? '';
  }

  return (
    <div>
      <div className="habits__top">
        <Button onClick={openNew}>Add habit</Button>
      </div>

      {habits.length === 0 ? (
        <div className="habits__empty">
          <p>No habits yet.</p>
          <Button variant="secondary" onClick={openNew}>
            Add habit
          </Button>
        </div>
      ) : (
        <ul className="habits__list">
          {habits.map((habit) => (
            <li key={habit.id} className="habit-item">
              <div className="habit-item__body">
                <span className="habit-item__title" dir="auto">
                  {habit.title}
                  {habit.active ? '' : ' (paused)'}
                </span>
                <span className="habit-item__meta">
                  {domainName(habit.domainId)} · {habit.target} {habit.unit} ·{' '}
                  {habit.daysOfWeek.map((day) => WEEKDAYS[day]).join(' ')}
                </span>
              </div>
              <div className="habit-item__actions">
                <Button variant="secondary" onClick={() => toggleActive(habit)}>
                  {habit.active ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(habit);
                    setFormOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => setDeleting(habit)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {uid && formOpen ? (
        <Sheet open onClose={() => setFormOpen(false)} title={editing ? 'Edit habit' : 'New habit'}>
          <HabitForm
            uid={uid}
            domains={domains}
            habit={editing}
            onClose={() => setFormOpen(false)}
          />
        </Sheet>
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this habit?"
        message="Days already created keep their tasks."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (uid && deleting) deleteHabit(uid, deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
