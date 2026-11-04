import { useState } from 'react'
import { getTheme, setTheme } from '../ui/theme'
import type { ThemeName } from '../ui/theme'
import Button from '../ui/components/Button'
import Chip from '../ui/components/Chip'
import { SelectField, TextField, TextareaField } from '../ui/components/Field'
import Sheet from '../ui/components/Sheet'
import ConfirmDialog from '../ui/components/ConfirmDialog'
import ProgressBar from '../ui/components/ProgressBar'
import ProgressRing from '../ui/components/ProgressRing'
import SyncChip from '../ui/components/SyncChip'
import { showErrorToast } from '../ui/components/Toast'
import './Styleguide.css'

const THEMES: ThemeName[] = ['paper', 'ink', 'moss']
const URDU = 'یہ ایک ٹیسٹ ہے'

export default function Styleguide() {
  const [theme, setCurrentTheme] = useState<ThemeName>(() => getTheme())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  function chooseTheme(name: ThemeName) {
    setTheme(name)
    setCurrentTheme(name)
  }

  return (
    <div className="styleguide">
      <div className="styleguide__bar">
        {THEMES.map((name) => (
          <Chip key={name} selected={theme === name} onClick={() => chooseTheme(name)}>
            {name}
          </Chip>
        ))}
      </div>

      <section className="sg-section">
        <h2 className="sg-section__title">Buttons</h2>
        <div className="sg-row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      <section className="sg-section">
        <h2 className="sg-section__title">Chips</h2>
        <div className="sg-row">
          <Chip>Study</Chip>
          <Chip selected>Selected</Chip>
        </div>
      </section>

      <section className="sg-section">
        <h2 className="sg-section__title">Fields</h2>
        <TextField id="sg-title" label="Title" placeholder="Physics numericals" />
        <TextField
          id="sg-urdu"
          label="Urdu text (dir auto)"
          defaultValue={URDU}
        />
        <TextField
          id="sg-error"
          label="With error"
          defaultValue="0"
          error="Enter a number above 0"
        />
        <SelectField id="sg-domain" label="Domain" defaultValue="study">
          <option value="study">Study</option>
          <option value="webdev">Web Dev</option>
          <option value="cyber">Cybersecurity</option>
        </SelectField>
        <TextareaField id="sg-notes" label="Notes" placeholder="Optional notes" />
      </section>

      <section className="sg-section">
        <h2 className="sg-section__title">Progress</h2>
        <div className="sg-stack">
          <ProgressBar value={0} label="Empty" />
          <ProgressBar value={0.35} label="Partial" />
          <ProgressBar value={1} label="Full" />
        </div>
        <div className="sg-row">
          <ProgressRing value={0} />
          <ProgressRing value={0.5} />
          <ProgressRing value={1} done />
        </div>
      </section>

      <section className="sg-section">
        <h2 className="sg-section__title">Sync status</h2>
        <div className="sg-row">
          <SyncChip state="synced" />
          <SyncChip state="syncing" />
          <SyncChip state="offline" />
        </div>
      </section>

      <section className="sg-section">
        <h2 className="sg-section__title">Overlays</h2>
        <div className="sg-row">
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>
            Open sheet
          </Button>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            Open confirm
          </Button>
          <Button variant="secondary" onClick={() => showErrorToast('Something went wrong')}>
            Show toast
          </Button>
        </div>
      </section>

      <section className="sg-section">
        <h2 className="sg-section__title">Urdu title</h2>
        <p className="sg-urdu-title" dir="auto">
          {URDU}
        </p>
      </section>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Task sheet">
        <p>Sheet content goes here.</p>
        <Button onClick={() => setSheetOpen(false)}>Close</Button>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this task?"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
