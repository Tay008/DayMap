import { useEffect, useState } from 'react';
import { reportError, subscribeDomains } from '../data/repo';
import type { Domain } from '../data/types';

export function useDomains(uid: string | null): Domain[] {
  const [domains, setDomains] = useState<Domain[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeDomains(uid, setDomains, reportError);
  }, [uid]);

  return domains;
}
