import { useMemo, useState } from 'react';
import type { Priority, Task } from '../data/types';
import { backlogOf } from '../lib/progress';
import { addDays, dayStartMs } from '../lib/time';
import { useAuth } from '../hooks/useAuth';
import { useToday } from '../hooks/useToday';
import { useDomains } from '../hooks/useDomains';
import { useOpenOneOffs } from '../hooks/useOpenOneOffs';
import { useRecentDone } from '../hooks/useRecentDone';
import Button from '../ui/components/Button';
import Chip from '../ui/components/Chip';
import Sheet from '../ui/components/Sheet';
import TaskForm from '../ui/components/TaskForm';
import TaskRow from '../ui/components/TaskRow';
import TaskSheet from '../ui/components/TaskSheet';
import './Tasks.css';

type Tab = 'open' | 'backlog' | 'done';

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 1, label: 'High' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Low' },
];

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
    <div>
      <div className="tasks__top">
        <Button onClick={openNew}>Add task</Button>
      </div>

      <div className="tasks__tabs" role="tablist">
        <Chip selected={tab === 'open'} onClick={() => setTab('open')}>
          Open ({openList.length})
        </Chip>
        <Chip selected={tab === 'backlog'} onClick={() => setTab('backlog')}>
          Backlog ({backlogList.length})
        </Chip>
        <Chip selected={tab === 'done'} onClick={() => setTab('done')}>
          Done ({doneList.length})
        </Chip>
      </div>

      <div className="tasks__filters">
        <Chip selected={domainFilter === null} onClick={() => setDomainFilter(null)}>
          All domains
        </Chip>
        {domains.map((domain) => (
          <Chip
            key={domain.id}
            selected={domainFilter === domain.id}
            onClick={() => setDomainFilter(domain.id)}
          >
            {domain.name}
          </Chip>
        ))}
        {PRIORITIES.map((entry) => (
          <Chip
            key={entry.value}
            selected={priorityFilter === entry.value}
            onClick={() =>
              setPriorityFilter(priorityFilter === entry.value ? null : entry.value)
            }
          >
            {entry.label}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="tasks__empty">
          <p>Nothing here yet.</p>
          <Button variant="secondary" onClick={openNew}>
            Add task
          </Button>
        </div>
      ) : (
        <div className="tasks__list">
          {shown.map((entry) => (
            <TaskRow
              key={entry.task.id}
              task={entry.task}
              domain={domainOf(entry.task)}
              ageDays={entry.ageDays}
              onOpen={() => setSelectedId(entry.task.id)}
            />
          ))}
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
