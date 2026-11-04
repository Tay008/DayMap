import { useState } from 'react';
import { deleteDomain, saveDomain } from '../data/repo';
import type { Domain } from '../data/types';
import { useAllTasks } from '../hooks/useAllTasks';
import { useAuth } from '../hooks/useAuth';
import { useDomains } from '../hooks/useDomains';
import Button from '../ui/components/Button';
import ConfirmDialog from '../ui/components/ConfirmDialog';
import { SelectField, TextField } from '../ui/components/Field';
import Sheet from '../ui/components/Sheet';
import { showErrorToast } from '../ui/components/Toast';
import { iconFor, iconProps } from '../ui/icons';
import './Domains.css';

const COLORS: Domain['colorIndex'][] = [1, 2, 3, 4, 5, 6, 7];
const ICON_KEYS = ['book', 'code', 'shield', 'moon', 'heart', 'home'];

export default function Domains() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const domains = useDomains(uid);
  const tasks = useAllTasks(uid);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Domain | null>(null);
  const [deleting, setDeleting] = useState<Domain | null>(null);
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState<Domain['colorIndex']>(1);
  const [icon, setIcon] = useState('book');
  const [error, setError] = useState('');

  const usedDomainIds = new Set(tasks.map((task) => task.domainId));

  function openNew(): void {
    setEditing(null);
    setName('');
    setColorIndex(1);
    setIcon('book');
    setError('');
    setFormOpen(true);
  }

  function openEdit(domain: Domain): void {
    setEditing(domain);
    setName(domain.name);
    setColorIndex(domain.colorIndex);
    setIcon(domain.icon);
    setError('');
    setFormOpen(true);
  }

  function submit(): void {
    if (!uid) return;
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 40) {
      setError('Name must be 1 to 40 characters');
      return;
    }
    const domain: Domain = {
      id: editing?.id ?? crypto.randomUUID(),
      name: trimmed,
      colorIndex,
      icon,
      order: editing?.order ?? domains.length + 1,
    };
    saveDomain(uid, domain);
    setFormOpen(false);
  }

  function requestDelete(domain: Domain): void {
    if (usedDomainIds.has(domain.id)) {
      showErrorToast('Reassign its tasks first');
      return;
    }
    setDeleting(domain);
  }

  return (
    <div>
      <div className="domains__top">
        <Button onClick={openNew}>Add domain</Button>
      </div>

      {domains.length === 0 ? (
        <div className="domains__empty">
          <p>No domains yet.</p>
          <Button variant="secondary" onClick={openNew}>
            Add domain
          </Button>
        </div>
      ) : (
        <ul className="domains__list">
          {domains.map((domain) => {
            const Icon = iconFor(domain.icon);
            return (
              <li key={domain.id} className="domain-item">
                <span
                  className="domain-item__color"
                  style={{ background: `var(--domain-${domain.colorIndex})` }}
                />
                <Icon {...iconProps} />
                <span className="domain-item__name" dir="auto">
                  {domain.name}
                </span>
                <div className="domain-item__actions">
                  <Button variant="secondary" onClick={() => openEdit(domain)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => requestDelete(domain)}>
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {uid && formOpen ? (
        <Sheet open onClose={() => setFormOpen(false)} title={editing ? 'Edit domain' : 'New domain'}>
          <div className="domain-form">
            <TextField
              id="domain-name"
              label="Name"
              value={name}
              error={error === '' ? undefined : error}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
            />
            <div className="domain-form__group">
              <span className="domain-form__label">Colour</span>
              <div className="domain-form__swatches">
                {COLORS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Colour ${value}`}
                    aria-pressed={value === colorIndex}
                    className={
                      value === colorIndex
                        ? 'domain-form__swatch domain-form__swatch--selected'
                        : 'domain-form__swatch'
                    }
                    style={{ background: `var(--domain-${value})` }}
                    onClick={() => setColorIndex(value)}
                  />
                ))}
              </div>
            </div>
            <SelectField
              id="domain-icon"
              label="Icon"
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
            >
              {ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </SelectField>
            <div className="domain-form__actions">
              <Button variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={submit}>
                {editing ? 'Save' : 'Add domain'}
              </Button>
            </div>
          </div>
        </Sheet>
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this domain?"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (uid && deleting) deleteDomain(uid, deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
