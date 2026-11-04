import { useEffect, useState } from 'react';
import { formatTimer } from '../../lib/time';
import Button from './Button';
import ConfirmDialog from './ConfirmDialog';
import { TextareaField } from './Field';
import Sheet from './Sheet';
import './UrgeSheet.css';

interface UrgeSheetProps {
  plan: string[];
  onClose: () => void;
  onUrge: () => void;
  onRelapse: () => void;
  onSavePlan: (plan: string[]) => void;
}

const DURATION_SECONDS = 10 * 60;

export default function UrgeSheet({ plan, onClose, onUrge, onRelapse, onSavePlan }: UrgeSheetProps) {
  const [remaining, setRemaining] = useState(DURATION_SECONDS);
  const [editing, setEditing] = useState(false);
  const [planText, setPlanText] = useState(plan.join('\n'));
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  function savePlan(): void {
    const lines = planText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    onSavePlan(lines);
    setEditing(false);
  }

  return (
    <Sheet open onClose={onClose} title="Urge">
      <div className="urge">
        <p className="urge__timer">{formatTimer(remaining)}</p>

        {plan.length === 0 ? (
          <p className="urge__empty">No plan yet.</p>
        ) : (
          <ul className="urge__plan">
            {plan.map((line, index) => (
              <li key={`${line}-${index}`} className="urge__line" dir="auto">
                {line}
              </li>
            ))}
          </ul>
        )}

        <div className="urge__actions">
          <Button onClick={onUrge}>I got through it</Button>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            I slipped
          </Button>
        </div>

        <Button variant="secondary" onClick={() => setEditing((value) => !value)}>
          {editing ? 'Close plan editor' : 'Edit plan'}
        </Button>

        {editing ? (
          <div className="urge__editor">
            <TextareaField
              id="urge-plan"
              label="Urge plan (one line each)"
              value={planText}
              onChange={(event) => setPlanText(event.target.value)}
            />
            <Button variant="secondary" onClick={savePlan}>
              Save plan
            </Button>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Log a slip?"
        message="This resets the current count. Best and total clean days stay."
        confirmLabel="Log slip"
        onConfirm={() => {
          setConfirmOpen(false);
          onRelapse();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Sheet>
  );
}
