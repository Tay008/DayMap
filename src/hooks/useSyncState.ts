import { useEffect, useState } from 'react';
import { reportError, subscribeSyncPending } from '../data/repo';
import type { SyncState } from '../ui/components/SyncChip';

// Offline (navigator.onLine is false), Syncing (the tasks listener reports pending
// writes, so listen with includeMetadataChanges), Synced (neither).
export function useSyncState(uid: string | null): SyncState {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    if (!uid) return;
    return subscribeSyncPending(uid, setPending, reportError);
  }, [uid]);

  if (!online) return 'offline';
  return pending ? 'syncing' : 'synced';
}
