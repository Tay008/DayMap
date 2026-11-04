import { useEffect, useState } from 'react';

// HEAD the azan file and report whether the server really serves audio.
export function useAzanFileMissing(): boolean {
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch('/audio/azan.mp3', { method: 'HEAD' })
      .then((response) => {
        if (cancelled) return;
        const type = response.headers.get('content-type') ?? '';
        setMissing(!response.ok || !type.startsWith('audio/'));
      })
      .catch(() => {
        // offline or blocked; leave the note off
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return missing;
}
