import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import SyncChip from './SyncChip'
import type { SyncState } from './SyncChip'
import { iconFor, iconProps } from '../icons'
import '../../styles/dm-shell.css'

interface TabDef {
  to: string
  label: string
  icon: string
  end?: boolean
}

const TABS: TabDef[] = [
  { to: '/', label: 'Today', icon: 'sun', end: true },
  { to: '/calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/tasks', label: 'Tasks', icon: 'tasks' },
  { to: '/more', label: 'More', icon: 'more' },
]

interface AppLayoutProps {
  title: string
  sync?: SyncState
  children: ReactNode
}

export default function AppLayout({ title, sync = 'synced', children }: AppLayoutProps) {
  return (
    <div className="dm-app">
      <nav className="dm-sb">
        <div className="dm-logo"><i></i>DayMap</div>
        {TABS.map((tab) => {
          const Icon = iconFor(tab.icon)
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => `dm-nav${isActive ? ' dm-on' : ''}`}
            >
              <Icon {...iconProps} />
              <span>{tab.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="dm-shell">
        <header className="dm-tb">
          <h1 dir="auto">{title}</h1>
          <SyncChip state={sync} />
        </header>
        {children}
      </div>
    </div>
  )
}
