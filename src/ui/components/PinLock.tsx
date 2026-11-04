import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Button from './Button';
import Chip from './Chip';
import { TextField } from './Field';
import Sheet from './Sheet';
import './PinLock.css';

const HASH_KEY = 'daymap.pin.hash';
const SALT_KEY = 'daymap.pin.salt';
const IDLE_MS = 2 * 60 * 1000;

async function hashPin(pin: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(salt + pin);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

interface PinLockProps {
  children: ReactNode;
}

// A speed-bump lock for the Streak screen: it re-locks on remount (leaving the screen)
// and after two minutes without pointer or keyboard activity.
export default function PinLock({ children }: PinLockProps) {
  const [hasPin, setHasPin] = useState(() => localStorage.getItem(HASH_KEY) !== null);
  const [locked, setLocked] = useState(() => localStorage.getItem(HASH_KEY) !== null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [setupOpen, setSetupOpen] = useState(false);

  useEffect(() => {
    if (!hasPin || locked) return;
    let timer = window.setTimeout(() => setLocked(true), IDLE_MS);
    const reset = (): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setLocked(true), IDLE_MS);
    };
    window.addEventListener('pointerdown', reset);
    window.addEventListener('keydown', reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', reset);
      window.removeEventListener('keydown', reset);
    };
  }, [hasPin, locked]);

  function clearPin(): void {
    localStorage.removeItem(HASH_KEY);
    localStorage.removeItem(SALT_KEY);
    setHasPin(false);
    setLocked(false);
    setPin('');
    setError('');
  }

  async function unlock(): Promise<void> {
    const salt = localStorage.getItem(SALT_KEY);
    const stored = localStorage.getItem(HASH_KEY);
    if (salt === null || stored === null) {
      setLocked(false);
      return;
    }
    try {
      const digest = await hashPin(pin, salt);
      if (digest === stored) {
        setLocked(false);
        setPin('');
        setError('');
      } else {
        setError('Wrong PIN');
      }
    } catch {
      setError('Could not check the PIN');
    }
  }

  async function savePin(): Promise<void> {
    if (!/^\d{4,6}$/.test(pin)) {
      setError('Enter 4 to 6 digits');
      return;
    }
    try {
      const salt = crypto.randomUUID();
      const digest = await hashPin(pin, salt);
      localStorage.setItem(SALT_KEY, salt);
      localStorage.setItem(HASH_KEY, digest);
      setHasPin(true);
      setLocked(false);
      setPin('');
      setError('');
      setSetupOpen(false);
    } catch {
      setError('Could not save the PIN');
    }
  }

  if (locked) {
    return (
      <div className="pin">
        <h2 className="pin__title">Locked</h2>
        <TextField
          id="pin-unlock"
          label="PIN"
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          error={error === '' ? undefined : error}
          onChange={(event) => setPin(event.target.value)}
        />
        <div className="pin__actions">
          <Button onClick={() => void unlock()}>Unlock</Button>
          <Button variant="secondary" onClick={clearPin}>
            Forgot PIN
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}

      <section className="pin-controls">
        <Chip selected={hasPin} onClick={() => (hasPin ? clearPin() : setSetupOpen(true))}>
          Lock this screen with a PIN
        </Chip>
        <p className="pin-controls__note">This PIN is a speed bump, not strong security.</p>
      </section>

      <Sheet
        open={setupOpen}
        onClose={() => {
          setSetupOpen(false);
          setPin('');
          setError('');
        }}
        title="Lock this screen with a PIN"
      >
        <div className="pin">
          <TextField
            id="pin-new"
            label="PIN (4 to 6 digits)"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            error={error === '' ? undefined : error}
            onChange={(event) => setPin(event.target.value)}
          />
          <p className="pin-controls__note">This PIN is a speed bump, not strong security.</p>
          <div className="pin__actions">
            <Button
              variant="secondary"
              onClick={() => {
                setSetupOpen(false);
                setPin('');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => void savePin()}>Save PIN</Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
