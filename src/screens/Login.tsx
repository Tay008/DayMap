import { useState } from 'react';
import Button from '../ui/components/Button';
import { TextField } from '../ui/components/Field';
import { signIn, signUp } from '../data/auth';
import './Login.css';

type Mode = 'signin' | 'signup';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(mode: Mode): Promise<void> {
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign in');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login__panel">
        <h1 className="login__title">DayMap</h1>
        <TextField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className="login__error">{error}</p> : null}
        <div className="login__actions">
          <Button variant="primary" disabled={busy} onClick={() => void submit('signin')}>
            Sign in
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => void submit('signup')}>
            Create account
          </Button>
        </div>
        <p className="login__note">You need internet once on each device to sign in.</p>
      </div>
    </div>
  );
}
