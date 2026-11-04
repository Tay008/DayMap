import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { exportBackup, importBackup } from '../data/backupRepo';
import { reportError } from '../data/repo';
import { parseBackup, summarizeBackup } from '../lib/backup';
import type { BackupData, BackupSummary } from '../lib/backup';
import { todayKey } from '../lib/time';
import { useAuth } from '../hooks/useAuth';
import Button from '../ui/components/Button';
import ConfirmDialog from '../ui/components/ConfirmDialog';
import './Backup.css';

function describe(summary: BackupSummary): string {
  const parts: string[] = [];
  if (summary.settings > 0) parts.push('settings');
  if (summary.domains > 0) parts.push(`${summary.domains} domains`);
  if (summary.habits > 0) parts.push(`${summary.habits} habits`);
  if (summary.tasks > 0) parts.push(`${summary.tasks} tasks`);
  if (summary.logs > 0) parts.push(`${summary.logs} logs`);
  if (summary.holidays > 0) parts.push(`${summary.holidays} holidays`);
  if (summary.dayOverrides > 0) parts.push(`${summary.dayOverrides} day overrides`);
  if (summary.counters > 0) parts.push(`${summary.counters} counters`);
  if (summary.counterEvents > 0) parts.push(`${summary.counterEvents} counter events`);
  return parts.length > 0 ? parts.join(', ') : 'no items';
}

export default function Backup() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [pending, setPending] = useState<BackupData | null>(null);
  const [summary, setSummary] = useState<BackupSummary | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function doExport(): Promise<void> {
    if (!uid || busy !== null) return;
    setBusy('export');
    setError('');
    setMessage('');
    try {
      const data = await exportBackup(uid);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daymap-backup-${todayKey()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`Backup downloaded (${summarizeBackup(data).total} items).`);
    } catch (caught) {
      reportError(caught);
      setError(caught instanceof Error ? caught.message : 'Could not export the backup.');
    } finally {
      setBusy(null);
    }
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    setError('');
    setMessage('');
    const text = await file.text();
    const data = parseBackup(text);
    if (data === null) {
      setError('That file is not a DayMap backup (version 1).');
      return;
    }
    setPending(data);
    setSummary(summarizeBackup(data));
    setConfirmOpen(true);
  }

  async function doImport(): Promise<void> {
    if (!uid || pending === null || busy !== null) return;
    const count = summary?.total ?? 0;
    setConfirmOpen(false);
    setBusy('import');
    setError('');
    setMessage('');
    try {
      await importBackup(uid, pending);
      setMessage(`Imported ${count} items.`);
      setPending(null);
      setSummary(null);
    } catch (caught) {
      reportError(caught);
      setError(caught instanceof Error ? caught.message : 'Could not import the backup.');
    } finally {
      setBusy(null);
    }
  }

  function cancelImport(): void {
    setConfirmOpen(false);
    setPending(null);
    setSummary(null);
  }

  return (
    <div className="backup">
      {error !== '' ? <p className="backup__error">{error}</p> : null}
      {message !== '' ? <p className="backup__message">{message}</p> : null}

      <section className="backup__section">
        <h2 className="backup__title">Export</h2>
        <p className="backup__text">
          Download one JSON file with this account&apos;s settings, domains, habits, tasks,
          history, holidays and day overrides. Counters kept on this device are included too.
        </p>
        <Button id="backup-export" onClick={() => void doExport()} disabled={busy !== null}>
          {busy === 'export' ? 'Exporting…' : 'Export backup'}
        </Button>
      </section>

      <section className="backup__section">
        <h2 className="backup__title">Import</h2>
        <p className="backup__text">
          Choose a DayMap backup file. It is checked first, and nothing is deleted. Importing
          the same file again is safe.
        </p>
        <input
          id="backup-file"
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="backup__input"
          onChange={(event) => void onFile(event)}
        />
        <Button
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
        >
          Choose file
        </Button>
        {pending !== null && summary !== null ? (
          <p className="backup__count">
            This file holds {summary.total} items: {describe(summary)}.
          </p>
        ) : null}
        {busy === 'import' ? <p className="backup__hint">Importing…</p> : null}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Import this backup?"
        message={
          summary === null
            ? undefined
            : `This will write ${summary.total} items. Nothing is deleted.`
        }
        confirmLabel="Import"
        onConfirm={() => void doImport()}
        onCancel={cancelImport}
      />
    </div>
  );
}
