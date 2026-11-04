import { useState } from 'react';
import { deleteDayOverride, saveDayOverride } from '../../data/repo';
import type { TemplateKey } from '../../lib/templates';
import type { DateKey } from '../../lib/time';
import Button from './Button';
import Sheet from './Sheet';
import './DayTypeMenu.css';

type Choice = 'auto' | 'college' | 'off';

const LABELS: Record<Choice, string> = {
  auto: 'Auto',
  college: 'College day',
  off: 'Off day',
};

const CHOICES: Choice[] = ['auto', 'college', 'off'];

function choiceOf(override: TemplateKey | null): Choice {
  if (override === null) return 'auto';
  return override === 'normal-college' || override === 'ramadan-college' ? 'college' : 'off';
}

interface DayTypeMenuProps {
  uid: string;
  dateKey: DateKey;
  override: TemplateKey | null;
  ramadan: boolean;
  disabled?: boolean;
}

export default function DayTypeMenu({
  uid,
  dateKey,
  override,
  ramadan,
  disabled = false,
}: DayTypeMenuProps) {
  const [open, setOpen] = useState(false);
  const current = choiceOf(override);

  function choose(choice: Choice): void {
    if (choice === 'auto') {
      deleteDayOverride(uid, dateKey);
    } else {
      const templateKey: TemplateKey =
        choice === 'college'
          ? ramadan
            ? 'ramadan-college'
            : 'normal-college'
          : ramadan
            ? 'ramadan-off'
            : 'normal-off';
      saveDayOverride(uid, { dateKey, templateKey });
    }
    setOpen(false);
  }

  return (
    <div className="day-type">
      <Button variant="secondary" disabled={disabled} onClick={() => setOpen(true)}>
        Day type: {LABELS[current]}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Day type">
        <div className="day-type__options">
          {CHOICES.map((choice) => (
            <Button
              key={choice}
              variant={choice === current ? 'primary' : 'secondary'}
              onClick={() => choose(choice)}
            >
              {LABELS[choice]}
            </Button>
          ))}
        </div>
        <p className="day-type__hint">Auto follows college days, holidays and Ramadan.</p>
      </Sheet>
    </div>
  );
}
