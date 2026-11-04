import './SyncChip.css'

export type SyncState = 'offline' | 'syncing' | 'synced'

const LABELS: Record<SyncState, string> = {
  offline: 'Offline',
  syncing: 'Syncing',
  synced: 'Synced',
}

export default function SyncChip({ state }: { state: SyncState }) {
  return <span className={`sync sync--${state}`}>{LABELS[state]}</span>
}
