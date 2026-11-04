import { useEffect, useState } from 'react';
import { onAuthChange } from '../data/auth';
import type { User } from '../data/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthChange((nextUser) => {
        setUser(nextUser);
        setLoading(false);
      }),
    [],
  );

  return { user, loading };
}
