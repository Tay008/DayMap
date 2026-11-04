import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import SyncChip from './SyncChip'
import type { SyncState } from './SyncChip'
import { iconFor, iconProps } from '../icons'
import './AppLayout.css'

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
    <div className="app">
      <aside className="app__sidebar">
        <div className="app__brand">DayMap</div>
        <nav className="app__sidebar-nav">
          {TABS.map((tab) => {
            const Icon = iconFor(tab.icon)
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `app__navlink${isActive ? ' app__navlink--active' : ''}`
                }
              >
                <Icon {...iconProps} />
                <span>{tab.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="app__main">
        <header className="app__header">
          <h1 className="app__title" dir="auto">
            {title}
          </h1>
          <SyncChip state={sync} />
        </header>
        <main className="app__content">{children}</main>
        <nav className="app__tabbar">
          {TABS.map((tab) => {
            const Icon = iconFor(tab.icon)
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) => `app__tab${isActive ? ' app__tab--active' : ''}`}
              >
                <Icon {...iconProps} />
                <span>{tab.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
