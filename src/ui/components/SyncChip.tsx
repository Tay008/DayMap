export type SyncState = 'offline' | 'syncing' | 'synced'

const LABELS: Record<SyncState, string> = {
  offline: 'Offline',
  syncing: 'Syncing',
  synced: 'Synced',
}

export default function SyncChip({ state }: { state: SyncState }) {
  const cls = state === 'syncing' ? ' dm-syncing' : state === 'offline' ? ' dm-offline' : ''
  return (
    <span className={`dm-sync${cls}`}>
      <i></i>
      {LABELS[state]}
    </span>
  )
}
