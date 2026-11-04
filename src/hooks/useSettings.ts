import { useEffect, useState } from 'react';
import { reportError, subscribeSettings } from '../data/repo';
import type { Settings } from '../data/types';

export function useSettings(uid: string | null): Settings | null {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeSettings(uid, setSettings, reportError);
  }, [uid]);

  return settings;
}
