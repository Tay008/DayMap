import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCounters } from '../hooks/useCounters';
import { useSettings } from '../hooks/useSettings';
import { useToday } from '../hooks/useToday';
import Button from '../ui/components/Button';
import CounterForm from '../ui/components/CounterForm';
import PinLock from '../ui/components/PinLock';
import Sheet from '../ui/components/Sheet';
import StreakMain from './StreakMain';
import './Streak.css';

export default function Streak() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const today = useToday();
  const settings = useSettings(uid);
  const { counters, events } = useCounters(uid);
  const [formOpen, setFormOpen] = useState(false);

  const counter = counters[0] ?? null;
  const counterEvents = useMemo(
    () => (counter ? events.filter((event) => event.counterId === counter.id) : []),
    [events, counter],
  );

  if (!counter) {
    return (
      <PinLock>
        <div className="streak-empty">
          <p>No counter yet.</p>
          <Button onClick={() => setFormOpen(true)}>Start a counter</Button>
        </div>
        <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Start a counter">
          {uid ? (
            <CounterForm uid={uid} today={today} onClose={() => setFormOpen(false)} />
          ) : null}
        </Sheet>
      </PinLock>
    );
  }

  return (
    <PinLock>
      <StreakMain
        key={counter.id}
        uid={uid}
        counter={counter}
        events={counterEvents}
        today={today}
        settings={settings}
      />
    </PinLock>
  );
}
