import { useEffect, useState } from 'react';
import { addEvent, setStorage } from '../data/counterRepo';
import { addMilestone, readMilestones } from '../data/milestoneStore';
import { saveSettings } from '../data/repo';
import type { Counter, CounterEvent, Settings } from '../data/types';
import { currentMilestone, streakStats } from '../lib/streaks';
import { formatDateLong, type DateKey } from '../lib/time';
import Button from '../ui/components/Button';
import ConfirmDialog from '../ui/components/ConfirmDialog';
import UrgeSheet from '../ui/components/UrgeSheet';

interface StreakMainProps {
  uid: string | null;
  counter: Counter;
  events: CounterEvent[];
  today: DateKey;
  settings: Settings | null;
}

export default function StreakMain({ uid, counter, events, today, settings }: StreakMainProps) {
  const stats = streakStats(counter, events, today);

  const [urgeOpen, setUrgeOpen] = useState(false);
  const [slip, setSlip] = useState(false);
  const [storageConfirm, setStorageConfirm] = useState(false);
  const [notice, setNotice] = useState<number | null>(() => {
    const reached = currentMilestone(stats.current);
    if (reached === null) return null;
    return readMilestones(counter.id).includes(reached) ? null : reached;
  });

  useEffect(() => {
    if (notice !== null) addMilestone(counter.id, notice);
  }, [counter.id, notice]);

  const history = [...events].sort((a, b) => b.at - a.at);

  function logSlip(): void {
    addEvent(uid, counter, { type: 'relapse' });
    setSlip(true);
  }

  return (
    <>
      <div className="streak">
        {notice !== null ? (
          <div className="streak__milestone">
            <span>{notice} days.</span>
            <Button variant="secondary" onClick={() => setNotice(null)}>
              Dismiss
            </Button>
          </div>
        ) : null}

        {slip ? (
          <p className="streak__slip">
            Streak reset. Your best is {stats.best} days and you have {stats.totalClean} clean
            days in total. Start again.
          </p>
        ) : null}

        <section className="streak__main">
          <p className="streak__label" dir="auto">
            {counter.label}
          </p>
          <p className="streak__current">{stats.current}</p>
          <p className="streak__unit">days</p>

          <div className="streak__stats">
            <div className="streak__stat">
              <span className="streak__stat-label">Best</span>
              <span className="streak__stat-value">{stats.best}</span>
            </div>
            <div className="streak__stat">
              <span className="streak__stat-label">Total clean days</span>
              <span className="streak__stat-value">{stats.totalClean}</span>
            </div>
            <div className="streak__stat">
              <span className="streak__stat-label">Urges handled</span>
              <span className="streak__stat-value">{stats.urges}</span>
            </div>
          </div>

          <div className="streak__actions">
            <Button onClick={() => setUrgeOpen(true)}>I have an urge</Button>
            <Button variant="secondary" onClick={logSlip}>
              Log a slip
            </Button>
          </div>
        </section>

        <section className="streak__storage">
          <p className="streak__storage-state">
            {counter.localOnly ? 'This device only' : 'Synced across devices'}
          </p>
          <Button variant="secondary" onClick={() => setStorageConfirm(true)}>
            {counter.localOnly ? 'Sync across devices' : 'Keep on this device only'}
          </Button>
        </section>

        <section className="streak__history">
          <h2 className="streak__history-title">History</h2>
          {history.length === 0 ? (
            <div className="streak__history-empty">
              <p>No events yet.</p>
              <Button variant="secondary" onClick={logSlip}>
                Log a slip
              </Button>
            </div>
          ) : (
            <ul className="streak__history-list">
              {history.map((event) => (
                <li key={event.id} className="streak__history-item">
                  <span className="streak__history-type">
                    {event.type === 'urge' ? 'Urge' : 'Slip'}
                  </span>
                  <span className="streak__history-date">{formatDateLong(event.dateKey)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {urgeOpen ? (
        <UrgeSheet
          plan={settings?.urgePlan ?? []}
          onClose={() => setUrgeOpen(false)}
          onUrge={() => {
            addEvent(uid, counter, { type: 'urge' });
            setUrgeOpen(false);
          }}
          onRelapse={() => {
            addEvent(uid, counter, { type: 'relapse' });
            setSlip(true);
            setUrgeOpen(false);
          }}
          onSavePlan={(plan) => {
            if (uid && settings) saveSettings(uid, { ...settings, urgePlan: plan });
          }}
        />
      ) : null}

      <ConfirmDialog
        open={storageConfirm}
        title={counter.localOnly ? 'Sync this counter?' : 'Keep this counter on this device?'}
        message={
          counter.localOnly
            ? "Synced data is stored on Google's servers under your account."
            : 'It will be removed from the servers and kept on this device only.'
        }
        confirmLabel={counter.localOnly ? 'Sync' : 'Keep local'}
        onConfirm={() => {
          setStorage(uid, counter, events, !counter.localOnly);
          setStorageConfirm(false);
        }}
        onCancel={() => setStorageConfirm(false)}
      />
    </>
  );
}
