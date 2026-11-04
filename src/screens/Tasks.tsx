import { useMemo, useState } from 'react';
import type { Priority, Task } from '../data/types';
import { backlogOf } from '../lib/progress';
import { addDays, dayStartMs } from '../lib/time';
import { useAuth } from '../hooks/useAuth';
import { useToday } from '../hooks/useToday';
import { useDomains } from '../hooks/useDomains';
import { useOpenOneOffs } from '../hooks/useOpenOneOffs';
import { useRecentDone } from '../hooks/useRecentDone';
import Sheet from '../ui/components/Sheet';
import TaskForm from '../ui/components/TaskForm';
import TaskSheet from '../ui/components/TaskSheet';
import '../styles/dm-tasks.css';

type Tab = 'open' | 'backlog' | 'done';

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 1, label: 'High' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Low' },
];

function domainColor(index: number): string {
  const colors = ['#FFB08A', '#8FD3C1', '#FF8FA3', '#C9CBF5', '#FFC83D', '#DDE2EE'];
  return colors[index % 6];
}

function IconPlus() {
  return (
    <svg className="dm-i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="dm-i" viewBox="0 0 24 24" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const today = useToday();
  const domains = useDomains(uid);
  const openOneOffs = useOpenOneOffs(uid);
  const cutoff = dayStartMs(addDays(today, -14));
  const recentDone = useRecentDone(uid, cutoff);

  const [tab, setTab] = useState<Tab>('open');
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const openList = openOneOffs.filter(
    (task) => task.plannedDate !== null && task.plannedDate >= today,
  );
  const backlogList = backlogOf(openOneOffs, today);
  const doneList = recentDone;

  const allTasks = useMemo(() => [...openOneOffs, ...recentDone], [openOneOffs, recentDone]);
  const selected = selectedId
    ? (allTasks.find((task) => task.id === selectedId) ?? null)
    : null;

  function matches(task: Task): boolean {
    if (domainFilter !== null && task.domainId !== domainFilter) return false;
    if (priorityFilter !== null && task.priority !== priorityFilter) return false;
    return true;
  }

  function domainOf(task: Task) {
    return domains.find((domain) => domain.id === task.domainId);
  }

  const shown: { task: Task; ageDays?: number }[] =
    tab === 'open'
      ? openList.filter(matches).map((task) => ({ task }))
      : tab === 'backlog'
        ? backlogList
            .filter((entry) => matches(entry))
            .map((entry) => ({ task: entry, ageDays: entry.ageDays }))
        : doneList.filter(matches).map((task) => ({ task }));

  function openNew(): void {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="dm-page">
      <div className="dm-tk-hd">
        <div className="dm-seg">
          <button className={tab === 'open' ? 'dm-on' : ''} onClick={() => setTab('open')} type="button">
            Open ({openList.length})
          </button>
          <button className={tab === 'backlog' ? 'dm-on' : ''} onClick={() => setTab('backlog')} type="button">
            Backlog ({backlogList.length})
          </button>
          <button className={tab === 'done' ? 'dm-on' : ''} onClick={() => setTab('done')} type="button">
            Done ({doneList.length})
          </button>
        </div>
        <button className="dm-primary" onClick={openNew} type="button">
          <IconPlus /> Add task
        </button>
      </div>
      <div className="dm-chips">
        <span className="dm-label">Domain</span>
        <button className={`dm-chip${domainFilter === null ? ' dm-on' : ''}`} onClick={() => setDomainFilter(null)} type="button">
          All
        </button>
        {domains.map((domain, idx) => (
          <button
            key={domain.id}
            className={`dm-chip${domainFilter === domain.id ? ' dm-on' : ''}`}
            onClick={() => setDomainFilter(domain.id)}
            type="button"
          >
            <i style={{ background: domainColor(idx) }}></i>
            {domain.name}
          </button>
        ))}
      </div>
      <div className="dm-chips">
        <span className="dm-label">Priority</span>
        {PRIORITIES.map((entry) => (
          <button
            key={entry.value}
            className={`dm-chip${priorityFilter === entry.value ? ' dm-on' : ''}`}
            onClick={() => setPriorityFilter(priorityFilter === entry.value ? null : entry.value)}
            type="button"
          >
            {entry.label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="dm-empty">
          <b className="dm-rt">Nothing here yet</b>
          <p className="dm-sub">Add a task, or check another tab.</p>
        </div>
      ) : (
        <div className="dm-list">
          {shown.map((entry) => {
            const task = entry.task;
            const dom = domainOf(task);
            const domIdx = domains.findIndex((d) => d.id === dom?.id);
            const color = domIdx >= 0 ? domainColor(domIdx) : '#DDE2EE';
            const left = (task.target ?? 0) - (task.progress ?? 0);
            const meta = dom ? `${dom.name}, ${left > 0 ? `${left} left` : 'done'}` : left > 0 ? `${left} left` : 'done';
            const done = task.doneAt !== null || (task.progress ?? 0) >= (task.target ?? 0);
            return (
              <div
                key={task.id}
                className="dm-item"
                onClick={() => setSelectedId(task.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedId(task.id);
                }}
              >
                <i style={{ background: color }}></i>
                <div className="dm-grow">
                  <b>{task.title}</b>
                  <small>{meta}</small>
                </div>
                <button className={`dm-check${done ? ' dm-on' : ''}`} aria-label="Mark done" type="button">
                  {done ? <IconCheck /> : null}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {uid && selected ? (
        <TaskSheet
          uid={uid}
          task={selected}
          domain={domainOf(selected)}
          open
          onClose={() => setSelectedId(null)}
          onEdit={() => {
            setEditing(selected);
            setSelectedId(null);
            setFormOpen(true);
          }}
        />
      ) : null}

      {uid && formOpen ? (
        <Sheet open onClose={() => setFormOpen(false)} title={editing ? 'Edit task' : 'New task'}>
          <TaskForm
            uid={uid}
            domains={domains}
            task={editing}
            onClose={() => setFormOpen(false)}
          />
        </Sheet>
      ) : null}
    </div>
  );
}
