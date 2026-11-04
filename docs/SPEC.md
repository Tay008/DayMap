# DayMap: Master Build Document (v1)

Prepared for Tayyab · Version 1.0 · 31 October 2026 · Working name "DayMap" (change it later in one file: `src/config/app.ts`)

## Part 0. How to use this document (for you, the human)

This document is the single source of truth for the whole app. It is written so that a weak AI can follow it without guessing. Your job is simple: feed it one step at a time, check the result yourself, save your progress, and move on.

### The routine for every build step

1. Open Part 10 and pick the next step. Never skip ahead.
2. Save the current working code first: `git add -A` then `git commit -m "before step N"`. If the AI wrecks something, `git reset --hard` brings you back.
3. Start a fresh AI chat. Long chats make weak models forget rules.
4. Paste the step prompt exactly as written. It tells the AI which Parts of this document to read.
5. Let the AI finish. If it asks a question, answer it. If it says it cannot do something, do not argue with it. Bring its message to me.
6. Run the step's **Done when** checklist yourself. Every box must be ticked by you, with your own eyes.
7. Commit: `git commit -m "step N done"`. Only then start the next step.

### Setup you do once

- Download this document as Markdown and save it inside the project folder as `docs/SPEC.md`. The AI will read it as a file.
- Install Node.js (LTS) and Git on your Windows PC. Check with `node -v` and `git -v` in PowerShell.
- Have two square PNG icons ready (192x192 and 512x512). Any simple image works for now.
- Optional: an azan audio file (mp3) that you have the right to use.
- Optional: the holiday dates you want pre-loaded (Eid dates and so on). Never let the AI make these up.

### Which AI for which step

Use your strongest model for Steps 3, 4 and 7 (date logic, sync, the Day Map). Cheaper models are fine for Steps 2, 5, 6, 8, 9, 10 and 11. If a cheaper model fails the same step twice, rerun that step with the strong one. Never put any AI key inside the app.

### When something goes wrong

- Same error after two tries: stop. Copy the exact error text and the file name and bring them to me, instead of telling the AI "fix it" again and again.
- The app behaves strangely after a step: run `git diff` to see what changed, or `git reset --hard` to go back.
- The AI wants to install a new package or "rewrite everything": say no.

## Part 1. What we are building

### In one paragraph

DayMap is an offline-first planner for one person that runs on his phone and his laptop, with both always showing the same data. It shows every day as a **map of rooms**, like a Resident Evil floor plan. Each room is a chunk of the day (Dawn Room, College, Study Hall and so on). A task is placed in a room as a *plan*, not as an appointment: it can be done at any time that day. If it is not finished when the day ends, it falls into the **Backlog** automatically and keeps whatever progress was already made.

### Glossary (use these exact words in code and in the UI)

| Term | Meaning |
| --- | --- |
| Day Map | The screen that shows one date as a vertical list of rooms. "Today" is the Day Map for today. |
| Room (code name: Zone) | A named chunk of one day with a start and end time, for example Study Hall, 4:30 PM to 6:10 PM. |
| Open room | A room that accepts tasks. |
| Sealed room | A room that does not accept tasks: Sleep, College, Prep & Commute, Sehri, Iftar, Taraweeh. It is still shown so he can see the shape of the day. |
| Template | The recipe that says which rooms a day has. There are four: normal-college, normal-off, ramadan-college, ramadan-off. |
| Task | One thing to do, with a target, progress, an optional date and an optional room. |
| Target and unit | How much counts as done: 1 check, 100 %, 6 items, 3000 ml. |
| Progress | How much has been done so far. A task is done when progress is at least the target. |
| Log | One progress entry, such as "+500 ml at 2:20 PM". Logs are the history. |
| Habit (daily goal) | A repeating thing that gets a fresh task every day, such as water 3000 ml. It never goes to the Backlog. |
| Backlog | One-off tasks that have no date, or whose date has passed while unfinished. It is calculated, never stored. |
| Domain | A category with a color and icon: Study, Web Dev, Cybersecurity, Quran, Health, Chores. |
| Prayer marker | A small label on the map at each prayer time. |
| Counter | The streak counter (days since a chosen date). Its label is neutral on purpose. |
| DateKey | A date written as text, `YYYY-MM-DD`, in Pakistan time. This is the only way dates are stored. |

### Real-life rules the app must respect

- The time zone is always **Asia/Karachi** (UTC+5, no daylight saving), whatever the device clock says.
- After the first login, everything works with no internet. Changes made offline sync by themselves when the connection returns.
- He is a hafiz and a student preparing for board exams. Quran revision (Sabaq, Sabqi, Manzil), seven school subjects, web development, cybersecurity learning and workouts must all fit. These are just Domains and Habits that he creates. Do not hard-code them.
- Text may be English, Urdu or Arabic, even mixed in one line.
- The phone is used in public, so the streak counter must look harmless.

## Part 2. Version 1 scope

### Build exactly this

1. Sign in with email and password. The same account works on every device, and it keeps working offline after the first login.
2. Live sync of all data between devices, with a small sync status chip (Synced, Syncing, Offline).
3. A Day Map for any date, built from the four templates, with prayer markers and a "you are here" marker.
4. Tasks: add, edit, delete, priority, domain, target and unit, notes, planned date, room. Click to place a task into a room. Drag and drop arrives in Step 10.
5. Progress logging on every task: Done, Half, custom amount, Undo last.
6. Habits (daily goals) such as water 3 L, with quick-add buttons.
7. Backlog (calculated), with a "plan for today" action. Remaining amounts are preserved (for example "2 of 6 numericals left").
8. A month Calendar with holidays, task dots, a per-day type override, and tap a day to open its Day Map.
9. Prayer times (adhan library, Karachi method, Hanafi Asr, Lahore coordinates) with adjustments, plus Ramadan mode with Sehri, Iftar and Taraweeh rooms, plus an optional azan sound that plays only while the app is open.
10. The Streak counter: current, best and total clean days, relapse and urge logging, an urge plan with a 10-minute timer, a neutral label, an optional PIN, and local-only storage by default.
11. Editable Domains, and a Settings screen (college times and days, Ramadan dates, Taraweeh length, prayer adjustments, theme).
12. Three themes: Paper, Ink, Moss.
13. Backup: export all data to a JSON file and import it back.
14. An installable PWA hosted on Firebase Hosting.

### Do NOT build in v1 (even if it looks easy)

Alarms or push notifications while the app is closed, any AI feature inside the app, social or multi-user features, XP, badges and Duolingo-style rewards (Phase 2), the Sunday recap, the daily ayah card, repeat rules beyond days of the week, subtasks, attachments, rich-text notes, calendar import or export, home-screen widgets, native apps, automatic light and dark switching, analytics, tracking, ads.

## Part 3. Golden rules (the AI must obey all of these, always)

1. **One step at a time.** Do only the step you were given and add nothing extra: no extra features, settings or screens. When finished, STOP. List the files you created or changed, then print the step's "Done when" checklist with pass or fail beside each line. Never start the next step.
2. **Read before writing.** Read the Parts of `docs/SPEC.md` named in the step prompt, completely. Read `PROGRESS.md` to see what already exists.
3. **Stay inside the stack.** Install only the packages listed in Part 4. If you think another one is needed, STOP and ask. Never use `--force` or `--legacy-peer-deps`.
4. **Never invent facts.** Do not make up prayer times, holiday dates, Islamic dates, Quran or hadith text, or Urdu and Arabic content. Use the `adhan` library for prayer times and data files the human supplies. If data is missing, create an empty file with the correct shape and say so.
5. **Never `await` a Firestore write inside UI code.** While offline, that promise does not finish until the server answers, so the screen would freeze. Fire the write, attach `.catch(showErrorToast)`, and let the live listener update the screen.
6. **Only `src/data/` may import from `firebase/*`.** Screens and components use hooks and functions from `src/data/` only.
7. **`progress` changes only through `increment()`** inside a batch that also creates or deletes the matching log (Part 5). Never write a plain number into `progress`. Never include `progress` when creating a task. Always read it as `task.progress ?? 0`.
8. **All dates are `DateKey` strings made by `src/lib/time.ts`.** Banned everywhere else: `getHours`, `getDate`, `getDay`, `toLocaleDateString`, `toLocaleTimeString`, `new Date(someString)`. The only exception is the small adapter inside `src/lib/prayer.ts`.
9. **TypeScript strict.** No `any`, no `@ts-ignore`, no `as` casts used to silence errors. `npm run build` must finish with zero errors before you call a step done.
10. **Pure logic gets tests.** Everything in `src/lib/` is pure functions with Vitest tests. Never delete or weaken a test to make it pass. Fix the code instead.
11. **Never block on the network.** Every screen renders from cached data. No spinner that waits for the internet. Every Firestore listener has an error callback that shows a toast.
12. **Small files.** One component per file, under 250 lines. Split anything bigger.
13. **Design law** (full version in Part 8). Flat surfaces. Borders, spacing and type weight create hierarchy. Only tokens, never hard-coded colors or pixel values inside components. No shadows except on the bottom sheet. No gradients (one hatch pattern for sealed rooms is the only exception). No blur or glass. No purple or neon. No emojis in the UI. Tap targets at least 44 px.
14. **UI words are plain and calm.** Short labels, no exclamation marks, no scolding or shaming text, ever, and above all inside the Streak module.
15. **Text direction.** Every element that shows user-typed text, and every input and textarea, has `dir="auto"`.
16. **Do not run git commands.** The human handles git. Do not touch files outside the step's scope. No "while I'm here" refactors.
17. **Unsure? Ask.** If two instructions seem to conflict, or something is unclear, STOP and ask one specific question instead of guessing.
18. **Keep `PROGRESS.md` honest.** At the end of every step, append: the step number, what was built, the files changed, anything not working, and anything you were unsure about.

## Part 4. Tech stack and project setup

### The stack (fixed, no substitutions)

| Layer | Choice | Notes |
| --- | --- | --- |
| Build | Vite + React + TypeScript (strict) | Create with `npm create vite@latest daymap -- --template react-ts` |
| Routing | `react-router-dom@6` using `HashRouter` | Hash routes work offline and on any host with no server rules |
| Offline app shell | `vite-plugin-pwa` | Service worker caches every file. Use `registerType: 'autoUpdate'` |
| Backend and sync | Firebase Auth (email and password) + Firestore with persistent local cache | Free Spark plan, no card. Do NOT use Cloud Storage or Cloud Functions (they need a paid plan) |
| UI state | `zustand` | UI only: open sheets, selected date. Never for synced data |
| Prayer times | `adhan` | Works offline |
| Icons | `lucide-react` |  |
| Fonts | `@fontsource/archivo`, `@fontsource/ibm-plex-mono` | Self-hosted so they work offline |
| Drag and drop | `@dnd-kit/core` | Step 10 only |
| Tests | `vitest` | For `src/lib` only |
| Hosting | Firebase Hosting | Step 11 |

There is no date library on purpose. Our own tiny helpers live in `src/lib/time.ts`.

### Folder structure (create exactly this)

```
daymap/
  docs/SPEC.md                  this document
  PROGRESS.md                   the AI logs each finished step here
  firestore.rules               copy of the rules in Part 5
  public/icon-192.png  icon-512.png
  public/audio/azan.mp3         optional, supplied by the human
  src/
    main.tsx  App.tsx
    config/app.ts               app name and constants
    lib/                        PURE logic + tests
      time.ts  prayer.ts  templates.ts  progress.ts  streaks.ts  *.test.ts
    data/                       ONLY place that touches Firebase
      firebase.ts  auth.ts  repo.ts  seed.ts  counterRepo.ts  types.ts
      seed/holidays-pk.json
    hooks/                      useTasks, useDay, useSettings ...
    state/ui.ts                 zustand store (UI only)
    ui/                         tokens.css  themes.css  base.css  components/
    screens/                    Login, Today, Calendar, Tasks, More, Streak, Settings
```

### Environment file

Create `.env.local` in the project root with these four keys, filled in from the Firebase console, and make sure `.gitignore` lists `.env.local`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

### Firebase initialisation (copy exactly)

```ts
// src/data/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
```

### Package scripts

`dev` (vite), `build` (`tsc -b && vite build`), `preview` (vite preview), `test` (`vitest run`).

### How the human tests offline mode

Run `npm run build`, then `npm run preview`. Open the address it prints. Wait for the app to load. Open browser DevTools, go to Application, then Service Workers, and tick **Offline**. Reload the page. The app must still open and show your data. At startup the app also calls `navigator.storage.persist()` so the browser is less likely to erase local data.

### PWA manifest values

name `DayMap`, short\_name `DayMap`, display `standalone`, start\_url `/`, theme\_color and background\_color `#F4EFE6`, icons 192 and 512 from `public/`. The glob for precached files must include `js,css,html,svg,png,woff2,json,mp3`. If the azan file is bigger than 2 MB, raise `maximumFileSizeToCacheInBytes` for it.

## Part 5. Data model and Firestore rules

Everything for one person lives under `users/{uid}/`. The `uid` is the signed-in user's id.

| Path | What it holds |
| --- | --- |
| `settings/main` | One document: Settings |
| `domains/{id}` | Domain |
| `habits/{id}` | Habit |
| `tasks/{id}` | Task |
| `logs/{id}` | Log (progress history) |
| `holidays/{id}` | Holiday |
| `dayOverrides/{dateKey}` | DayOverride (document id is the DateKey) |
| `counters/{id}` and `counterEvents/{id}` | Only for counters that are NOT local-only (Part 9, Streak) |

### Types (copy into `src/data/types.ts`)

```ts
import type { PrayerName } from '../lib/prayer';

export type DateKey = string;            // 'YYYY-MM-DD', Pakistan time
export type Priority = 1 | 2 | 3;        // 1 = high
export type TemplateKey = 'normal-college' | 'normal-off' | 'ramadan-college' | 'ramadan-off';

export interface Domain { id: string; name: string; colorIndex: 1|2|3|4|5|6|7; icon: string; order: number; }

export interface Task {
  id: string;
  title: string;                  // 1 to 120 characters
  domainId: string;
  priority: Priority;
  kind: 'one_off' | 'daily_goal';
  target: number;                 // greater than 0
  unit: string;                   // 'check' | '%' | 'items' | 'pages' | 'min' | 'ml' | any short text
  plannedDate: DateKey | null;    // null = unplanned, shows in Backlog
  zoneId: string | null;          // room id from that day's template, or null
  notes: string;
  habitId: string | null;         // set on daily_goal instances
  progress?: number;              // changed ONLY by increment(); read as progress ?? 0
  doneAt: number | null;          // ms when progress first reached target, else null (always written)
  createdAt: number;
  updatedAt: number;
}

export interface Log { id: string; taskId: string; amount: number; dateKey: DateKey; at: number; }

export interface Habit {
  id: string; title: string; domainId: string; priority: Priority;
  target: number; unit: string;
  daysOfWeek: number[];           // 0 = Sunday ... 6 = Saturday
  quickAdds: number[];            // e.g. [250, 500]
  active: boolean; createdAt: number; updatedAt: number;
}

export interface Settings {
  collegeStart: number;           // minutes since midnight, default 480 (8:00 AM)
  collegeEnd: number;             // default 840 (2:00 PM)
  collegeDays: number[];          // default [1,2,3,4,5]
  ramadanStart: DateKey | null;   // typed in by the human after moon sighting
  ramadanDays: 29 | 30;           // default 30
  taraweehMinutes: number;        // default 90
  lat: number; lng: number;       // default 31.5204, 74.3587 (Lahore)
  adjust: Record<PrayerName, number>;   // minutes to add, default all 0
  azanSound: boolean;             // default false
  theme: 'paper' | 'ink' | 'moss';
  urgePlan: string[];
}

export interface Holiday { id: string; dateKey: DateKey; name: string; }
export interface DayOverride { dateKey: DateKey; templateKey: TemplateKey; }
export interface Counter { id: string; label: string; startDateKey: DateKey; localOnly: boolean; createdAt: number; }
export interface CounterEvent { id: string; counterId: string; type: 'relapse' | 'urge'; dateKey: DateKey; at: number; note: string; }
```

### Security rules (also saved as `firestore.rules`)

The human pastes these into Firebase console, Firestore Database, Rules, then presses Publish. They make sure only the signed-in owner can read or write their own data.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Why progress works the way it does

Two devices can be offline at the same time and both log water. If each device wrote "progress = 1500" over the other, one drink would vanish. `increment()` is different: Firestore adds the amounts together, so both drinks count. The log documents are the readable history, and the `progress` number on the task is a running total kept in step with them.

### Write patterns (the AI must copy these)

```ts
// Log progress. Lives in src/data/repo.ts. NOT awaited by the caller.
export function logProgress(uid: string, task: Task, amount: number): void {
  const now = Date.now();
  const newProgress = (task.progress ?? 0) + amount;
  const logId = crypto.randomUUID();
  const batch = writeBatch(db);
  batch.set(doc(db, `users/${uid}/logs/${logId}`),
    { id: logId, taskId: task.id, amount, dateKey: todayKey(), at: now });
  batch.update(doc(db, `users/${uid}/tasks/${task.id}`), {
    progress: increment(amount),
    doneAt: newProgress >= task.target ? (task.doneAt ?? now) : null,
    updatedAt: now,
  });
  batch.commit().catch(reportError);
}
```

- **Undo last** deletes the newest log of that task and applies `increment(-amount)` in one batch, and recomputes `doneAt` the same way. Undo is only offered for logs from today or yesterday (the app keeps a live listener on logs where `dateKey` is yesterday or later).
- **Creating a task** writes every field except `progress`, and always writes `doneAt: null`.
- **Editing a task's target** recomputes `doneAt` from the current progress with the helper `computeDoneAt(progress, target, existingDoneAt)` in `src/lib/progress.ts`.
- **Daily goal instances** are created with a fixed id `${habitId}_${dateKey}` using `setDoc(ref, data, { merge: true })` and never include `progress`. Two devices creating the same instance at once then write identical data and nothing is lost.

### Query rules (Firestore breaks if these are ignored)

- Never combine a `where` on one field with `orderBy` on a different field. That needs a special index and fails silently in the app. Fetch, then sort in code.
- The queries the app uses, and no others:
  - Day Map: `where('plannedDate', '==', dateKey)`
  - Backlog source: `where('kind', '==', 'one_off')` and `where('doneAt', '==', null)` (two equality filters are fine). The Backlog is then filtered in code, see Part 7.
  - Calendar month: `where('plannedDate', '>=', monthStart)` and `where('plannedDate', '<=', monthEnd)` (same field twice is fine).
  - Recent logs: `where('dateKey', '>=', yesterdayKey)`
  - Everything else (domains, habits, holidays, overrides, settings) is small. Listen to the whole collection.
- Document ids for habits, domains and holidays are made with `crypto.randomUUID()`, except the seeded domains (ids `study`, `webdev`, `cyber`, `quran`, `health`, `chores`).

### First-login seeding (`src/data/seed.ts`)

On sign-in, read `settings/main`. If it does not exist, write in one batch: the six domains, default Settings, one Habit called Water (target 3000, unit `ml`, quickAdds `[250, 500]`, every day of the week, domain `health`), and the holidays from `src/data/seed/holidays-pk.json`. Never overwrite anything if `settings/main` already exists.

The holiday file starts with fixed-date national days only, and the human adds the rest himself (Eid, Ashura and other moon-dependent days) in Settings:

```json
[
  { "dateKey": "2026-12-25", "name": "Quaid-e-Azam Day" },
  { "dateKey": "2027-02-05", "name": "Kashmir Solidarity Day" },
  { "dateKey": "2027-03-23", "name": "Pakistan Day" },
  { "dateKey": "2027-05-01", "name": "Labour Day" },
  { "dateKey": "2027-08-14", "name": "Independence Day" }
]
```

### Sync status chip

A small chip in the app header with three states: **Offline** (`navigator.onLine` is false), **Syncing** (the tasks listener reports `snapshot.metadata.hasPendingWrites`, so listen with `includeMetadataChanges: true`), **Synced** (neither).

## Part 6. Time, prayers and day templates

### 6.1 Time helpers: `src/lib/time.ts`

Pakistan has no daylight saving, so a fixed +5 hour offset is exactly right. If that ever changes, this is the only file to edit.

```ts
export type DateKey = string;
const OFFSET_MS = 5 * 60 * 60 * 1000;

export function dateKeyFromMs(ms: number): DateKey {
  return new Date(ms + OFFSET_MS).toISOString().slice(0, 10);
}
export function todayKey(): DateKey { return dateKeyFromMs(Date.now()); }
export function minutesOfDay(ms: number): number {
  const d = new Date(ms + OFFSET_MS);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}
function parts(key: DateKey): [number, number, number] {
  const [y, m, d] = key.split('-').map(Number);
  return [y, m, d];
}
export function addDays(key: DateKey, n: number): DateKey {
  const [y, m, d] = parts(key);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
export function diffDays(a: DateKey, b: DateKey): number {   // a minus b
  const t = (k: DateKey) => { const [y, m, d] = parts(k); return Date.UTC(y, m - 1, d); };
  return Math.round((t(a) - t(b)) / 86400000);
}
export function weekdayOf(key: DateKey): number {             // 0 = Sunday
  const [y, m, d] = parts(key);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
```

Also export these, built with `Intl.DateTimeFormat` and `timeZone: 'Asia/Karachi'` (for instants) or `timeZone: 'UTC'` (for DateKeys turned into a UTC-noon Date): `formatClock(ms)` giving `4:32 PM`, `formatMinutes(min)` for 0 to 1440, `formatDateLong(key)` giving `Saturday, 31 October 2026`, and `monthGrid(year, month)` giving the weeks of a month as DateKeys, weeks starting on Monday.

**Tests that must exist and pass:**

- `dateKeyFromMs(Date.UTC(2026,9,31,18,59,59))` is `2026-10-31`, and one second later (`19:00:00` UTC) is `2026-11-01`.
- `addDays('2027-02-28', 1)` is `2027-03-01`, and `addDays('2028-02-28', 1)` is `2028-02-29`.
- `diffDays('2026-11-01', '2026-10-31')` is `1`, and `weekdayOf('2026-10-31')` is `6`.
- Run the whole suite twice, once with the machine time zone set to UTC and once to Asia/Karachi (PowerShell: `$env:TZ='UTC'; npm test`). Results must be identical.

### 6.2 Prayer times: `src/lib/prayer.ts`

```ts
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { minutesOfDay, type DateKey } from './time';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerDay = Record<PrayerName, number>;   // absolute ms

export function prayerTimesMs(key: DateKey, lat: number, lng: number,
                              adjust: Record<PrayerName, number>): PrayerDay {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);          // adhan reads Y/M/D from this; allowed here only
  const params = CalculationMethod.Karachi();  // Univ. of Islamic Sciences, Karachi
  params.madhab = Madhab.Hanafi;               // Asr
  const pt = new PrayerTimes(new Coordinates(lat, lng), date, params);
  const at = (t: Date, n: number) => t.getTime() + n * 60000;
  return {
    fajr: at(pt.fajr, adjust.fajr), sunrise: at(pt.sunrise, adjust.sunrise),
    dhuhr: at(pt.dhuhr, adjust.dhuhr), asr: at(pt.asr, adjust.asr),
    maghrib: at(pt.maghrib, adjust.maghrib), isha: at(pt.isha, adjust.isha),
  };
}
export function prayerMinutes(p: PrayerDay): Record<PrayerName, number> {
  return { fajr: minutesOfDay(p.fajr), sunrise: minutesOfDay(p.sunrise), dhuhr: minutesOfDay(p.dhuhr),
           asr: minutesOfDay(p.asr), maghrib: minutesOfDay(p.maghrib), isha: minutesOfDay(p.isha) };
}
```

Also export `nextPrayer(nowMs, day)` returning the next prayer name and its time, or Fajr of tomorrow after Isha (compute tomorrow's day for that).

**Tests:** the order is always fajr < sunrise < dhuhr < asr < maghrib < isha. Lahore sanity ranges (in minutes of day): fajr 240 to 390, dhuhr 660 to 780, maghrib 1020 to 1185. Adjusting `fajr: 5` moves Fajr by exactly 5 minutes. Output is identical under both time zones.

**Human check (not the AI's job):** compare today's Fajr and Maghrib with a printed timetable from your own masjid. If they differ by more than 2 or 3 minutes, set the difference in Settings, Prayer adjustments. Do not let the AI change the calculation method.

### 6.3 Templates: `src/lib/templates.ts`

```ts
import type { PrayerName } from './prayer';
export type RoomKind = 'open' | 'sleep' | 'school' | 'travel' | 'meal' | 'worship';
export type TimeRef =
  | { t: 'clock'; min: number }                                        // 22:30 is 1350, midnight end is 1440
  | { t: 'prayer'; p: PrayerName; off: number; plusTaraweeh?: boolean } // prayer time + off minutes
  | { t: 'college'; which: 'start' | 'end'; off: number };            // from Settings
export interface ZoneDef { id: string; name: string; kind: RoomKind; start: TimeRef; end: TimeRef; }
export interface ResolvedZone extends ZoneDef { startMin: number; endMin: number; }
```

**Only rooms of kind `open` accept tasks.** Every other kind is a sealed room.

**The resolver** `resolveTemplate(zones, prayerMin, settings): ResolvedZone[]` follows these steps in this order, and never throws:

1. Turn each start and end into minutes. A `prayer` ref is that prayer's minute plus `off`, plus `settings.taraweehMinutes` if `plusTaraweeh` is true. A `college` ref is `collegeStart` or `collegeEnd` plus `off`.
2. Clamp every value to the range 0 to 1440.
3. Remove any room whose end is not after its start.
4. Sort by start.
5. If a room starts before the previous room ends, move its start to the previous end. Remove it if nothing is left.
6. Return the rest. Gaps between rooms are fine and stay empty.

**Choosing the template for a date:**

```ts
export function pickTemplateKey(key: DateKey, s: Settings, holidays: Set<DateKey>,
                                override?: TemplateKey): TemplateKey {
  if (override) return override;
  const since = s.ramadanStart === null ? -1 : diffDays(key, s.ramadanStart);
  const ramadan = since >= 0 && since < s.ramadanDays;
  const college = s.collegeDays.includes(weekdayOf(key)) && !holidays.has(key);
  if (ramadan) return college ? 'ramadan-college' : 'ramadan-off';
  return college ? 'normal-college' : 'normal-off';
}
```

**The four default templates** (stored in code as `defaultTemplates`, not editable in the app in v1). Legend: `[cs]` is college start, `[ce]` is college end, `+T` adds Taraweeh minutes, a plain prayer name means that prayer's time, and `00:00`, `22:30`, `24:00` are clock times. Room ids are shared between templates on purpose, so a task keeps its room when the day type changes. If a task's room id does not exist in the day's template, show that task in the Unplaced tray and leave its data alone.

**normal-college**

| id | name | kind | starts | ends |
| --- | --- | --- | --- | --- |
| sleep-a | Sleep | sleep | 00:00 | fajr |
| dawn | Dawn Room | open | fajr | \[cs\] - 60 |
| prep | Prep & Commute | travel | \[cs\] - 60 | \[cs\] |
| college | College | school | \[cs\] | \[ce\] |
| recovery | Recovery Room | open | \[ce\] | asr |
| study | Study Hall | open | asr | maghrib |
| evening | Evening Room | open | maghrib | isha |
| night | Night Lab | open | isha | 22:30 |
| sleep-b | Sleep | sleep | 22:30 | 24:00 |

**normal-off**

| id | name | kind | starts | ends |
| --- | --- | --- | --- | --- |
| sleep-a | Sleep | sleep | 00:00 | fajr |
| dawn | Dawn Room | open | fajr | sunrise + 120 |
| morning | Morning Room | open | sunrise + 120 | dhuhr |
| midday | Midday Room | open | dhuhr | asr |
| study | Study Hall | open | asr | maghrib |
| evening | Evening Room | open | maghrib | isha |
| night | Night Lab | open | isha | 22:30 |
| sleep-b | Sleep | sleep | 22:30 | 24:00 |

**ramadan-college**

| id | name | kind | starts | ends |
| --- | --- | --- | --- | --- |
| sleep-a | Sleep | sleep | 00:00 | fajr - 60 |
| sehri | Sehri | meal | fajr - 60 | fajr |
| dawn | Dawn Room | open | fajr | \[cs\] - 60 |
| prep | Prep & Commute | travel | \[cs\] - 60 | \[cs\] |
| college | College | school | \[cs\] | \[ce\] |
| recovery | Rest Room | open | \[ce\] | asr |
| study | Study Hall | open | asr | maghrib - 30 |
| iftar | Iftar | meal | maghrib - 30 | maghrib + 30 |
| evening | Evening Room | open | maghrib + 30 | isha |
| taraweeh | Isha & Taraweeh | worship | isha | isha +T |
| night | Night Lab | open | isha +T | 23:00 |
| sleep-b | Sleep | sleep | 23:00 | 24:00 |

**ramadan-off**

| id | name | kind | starts | ends |
| --- | --- | --- | --- | --- |
| sleep-a | Sleep | sleep | 00:00 | fajr - 60 |
| sehri | Sehri | meal | fajr - 60 | fajr |
| dawn | Dawn Room | open | fajr | sunrise + 120 |
| morning | Morning Room | open | sunrise + 120 | dhuhr |
| midday | Midday Room | open | dhuhr | asr |
| study | Study Hall | open | asr | maghrib - 30 |
| iftar | Iftar | meal | maghrib - 30 | maghrib + 30 |
| evening | Evening Room | open | maghrib + 30 | isha |
| taraweeh | Isha & Taraweeh | worship | isha | isha +T |
| night | Night Lab | open | isha +T | 23:00 |
| sleep-b | Sleep | sleep | 23:00 | 24:00 |

The prayers themselves are not rooms. They appear as **prayer markers**: a small line and label (for example "Maghrib 5:41 PM") placed between the rooms at the right time, using the plain name of the prayer and no jokes.

**Tests that must exist and pass:** `pickTemplateKey` for a Tuesday outside Ramadan gives `normal-college`, for a Saturday gives `normal-off`, for a Tuesday on a holiday gives `normal-off`, for a Tuesday inside Ramadan gives `ramadan-college`, and the first and last day of Ramadan are inside while the day after the last is outside. An override always wins. `resolveTemplate` drops a room whose end is not after its start, trims overlaps, sorts by start, and for `ramadan-off` produces Taraweeh from Isha to Isha plus 90 and Night Lab starting at that same minute.

## Part 7. Core logic (pure functions in `src/lib`, every one with tests)

### 7.1 Progress, backlog and the Day Map: `src/lib/progress.ts`

| Function | Rule |
| --- | --- |
| `progressOf(task)` | `task.progress ?? 0` |
| `isDone(task)` | `progressOf(task) >= task.target` |
| `remaining(task)` | `max(0, target - progress)` |
| `fraction(task)` | `min(1, progress / target)` |
| `computeDoneAt(progress, target, existing, now)` | If `progress >= target` return `existing ?? now`, otherwise `null`. `repo.ts` must call this helper instead of repeating the expression |
| `doneAmount(task)` | The remaining amount. The Done button logs this. Hidden if nothing remains |
| `halfAmount(task)` | `min(remaining, ceil(target * 0.5))`. The Half button appears only when `target >= 2` |
| `dayProgress(tasks)` | Tasks planned for one date. Result is the average of `fraction` as a whole percent, plus done count and total. No tasks gives `null` |
| `backlogOf(openOneOffs, today)` | Keep tasks that are `one_off`, not done, and either have no `plannedDate` or a `plannedDate` before today. Tasks planned for today or later are not Backlog. Add `ageDays` (days since the planned date, or since creation if unplanned). Sort by priority (1 first), then older first |
| `groupByRoom(tasks, zones)` | Returns tasks per room id. Tasks with no `zoneId`, or a `zoneId` missing from today's rooms, go to `unplaced`. Sort inside a room by priority, then `createdAt` |

A custom amount can be any positive number and may go past the target (he may drink more than 3 L). Done and Half never go past the target.

**Daily goals never enter the Backlog.** Yesterday's missed water is not debt.

**Tests that must exist:** a task with target 6 and progress 4 has `remaining` 2 and `fraction` about 0.67. `halfAmount` of target 6 with progress 5 is 1. `computeDoneAt` returns `null` after an undo that drops progress below the target. `backlogOf` includes an unplanned task and one planned yesterday, excludes one planned today and any task that is done or is a `daily_goal`, and sorts as described. `dayProgress` of two tasks at 100% and 50% is 75%.

### 7.2 Streak maths: `src/lib/streaks.ts`

`streakStats(counter, events, today)` returns `current`, `best`, `totalClean`, `urges`.

- Take the distinct DateKeys of `relapse` events that fall between the counter's start date and today, sorted. Call them r1, r2 and so on.
- `current` is `diffDays(today, lastRelapse ?? startDateKey)`. A slip logged today gives 0.
- `best` is the largest of these gaps: start to r1, r1 to r2, and so on, and the last relapse (or start) to today.
- `totalClean` is `max(0, diffDays(today, start) - number of relapse dates before today)`.
- `urges` is the count of `urge` events.
- A relapse resets only `current`. It never touches `best`, `totalClean` or `urges`.

**Tests:** start `2026-10-01`, today `2026-10-31`, no events: current 30, best 30, totalClean 30. One relapse on `2026-10-10`: current 21, best 21, totalClean 29. Two relapses on the same date count as one. A relapse today: current 0, best 30. A relapse dated before the start date is ignored.

### 7.3 Azan sound rule

A background check every 15 seconds while the app is open. For each of Fajr, Dhuhr, Asr, Maghrib and Isha (not sunrise): if the prayer time has passed by no more than 2 minutes and that prayer has not already fired today, show a banner ("Maghrib time", with a Stop button) and, if `settings.azanSound` is on, play `/audio/azan.mp3`. Remember what already fired in `localStorage` under the key `daymap.azan.fired` as `dateKey:prayer`. Browsers block sound until the person has tapped something, so on the first tap anywhere call `load()` on the audio element, and if `play()` is refused, show "Tap to enable sound" in the banner. Say plainly in Settings: *the azan only plays while DayMap is open on that device*. Never play on app start for a prayer that passed more than 2 minutes ago.

## Part 8. Design system

### 8.1 Direction: the field map

Imagine a well-printed paper floor plan. Warm paper, black ink lines, one loud accent color. Rooms are drawn like rooms: thick outlines with small doors between them. Type is the decoration, and everything else stays quiet. Times and numbers are set in the mono font so they line up like map coordinates.

### 8.2 Tokens (`src/ui/tokens.css` and `src/ui/themes.css`)

The theme is a `data-theme` attribute on `<html>`. A copy of the choice is kept in `localStorage` as `daymap.theme` and applied by a tiny inline script in `index.html` before React starts, so there is no flash of the wrong theme.

**Fixed tokens:** spacing `--s-1` to `--s-7` = 4, 8, 12, 16, 24, 32, 48 px. Type sizes `--t-xs` to `--t-2xl` = 12, 14, 16, 20, 28, 40 px. Radius `--r-0` = 0 and `--r-1` = 4 px. Borders `--b-thin` = 1 px and `--b-thick` = 2 px. `--tap` = 44 px. Font weights: Archivo 400, 600, 700 and IBM Plex Mono 400, 500, imported from `@fontsource`. Nothing else.

**Theme colors:**

| Token | Paper | Ink (dark) | Moss |
| --- | --- | --- | --- |
| `--bg` | #F4EFE6 | #12110F | #E9EDE3 |
| `--surface` | #FBF8F2 | #1C1B18 | #F5F7F0 |
| `--ink` (text and thick lines) | #15130F | #F2EDE3 | #14201A |
| `--muted` | #6B6558 | #A39D8F | #5A675F |
| `--line-soft` | #D8D0C0 | #3A3731 | #C9D2C3 |
| `--accent` | #C93C20 | #FF6A45 | #1F6B4A |
| `--accent-ink` (text on accent) | #FFFFFF | #12110F | #FFFFFF |
| `--ok` | #2F7D4F | #6FCF97 | #3C7A2A |
| `--danger` | #B3261E | #FF6B5E | #B3261E |

**Domain colors** (same in all themes): `--domain-1` to `--domain-7` = #C93C20, #B8860B, #4F7A3A, #1F7A7A, #2E5EAA, #7A5230, #4B5563.

### 8.3 Component rules

- **Button.** Primary has an ink background with surface-colored text. Secondary is transparent with a 2 px ink border. A danger variant uses danger-colored text. Minimum height 44 px, radius 4 px. Pressed state moves it down 1 px. Disabled is 40% opacity.
- **Chip.** 1 px border. Selected chips fill with ink.
- **Room card.** 2 px ink border, surface background, radius 0. Header row: room name in weight 700 on the left, time range in mono and muted on the right. Task rows below. Last row is a 44 px "Add task" row with a 1 px dashed soft line. A short 2 px vertical line (16 px tall) between rooms is the "door".
- **Sealed room.** Hatched background: `repeating-linear-gradient(45deg, var(--line-soft) 0 1px, transparent 1px 8px)`. This is the only gradient allowed in the app. Muted text, a small kind icon, no add row.
- **Current room.** Today only. A 2 px accent border and a small "NOW" tag (mono, uppercase, accent background) in the header.
- **Prayer marker.** A 1 px dashed line with a mono label such as `Maghrib 5:41 PM`, placed between rooms at the right time.
- **Task row.** A left bar in the domain color whose width shows priority: 8 px high, 5 px medium, 3 px low. Title in weight 600 (wraps up to two lines). Under it a mono muted line such as `Study  ·  2 left`. On the right a 28 px progress ring (2 px stroke) that becomes a filled ring with a check mark when done. Done tasks have a line through the title in muted color.
- **Bottom sheet.** Slides up, surface background, 2 px top border, dimmed backdrop. No shadow needed.
- **Forms.** Label above the field. Field height 44 px, 2 px ink border, surface background. Error text in `--danger` below the field.
- **Focus.** `outline: 3px solid var(--accent); outline-offset: 2px` on everything that can be focused.
- **Motion.** Exactly three animations: sheet slide (200 ms), progress ring and bar fill (300 ms), toast appear (150 ms). All are disabled under `prefers-reduced-motion`.
- **Empty states.** One plain sentence and one button. Nothing decorative.
- **Icons.** `lucide-react` only, 20 px, `strokeWidth` 1.75, always looked up through a key map in `src/ui/icons.ts` (domain icons are stored as keys such as `book`, `code`, `shield`, `moon`, `heart`, `home`).

### 8.4 Layout

- **Phone (under 900 px):** one column, maximum width 560 px, a header of 56 px (page title and the sync chip), a bottom tab bar of 56 px plus the safe-area inset with four tabs: Today, Calendar, Tasks, More. The viewport meta tag includes `viewport-fit=cover`.
- **Desktop (900 px and up):** a 220 px left sidebar with the same four items. Today becomes two columns: the Day Map on the left, and Daily Goals, Backlog and the prayer list on the right.

### 8.5 The banned list (reject any output that contains these)

Gradients (except the hatch), glass or blur effects, drop shadows on cards or buttons, pill-shaped everything, purple, indigo or neon colors, emoji used as icons, floating blobs, gradient text, bouncing or pulsing animations, confetti, centered hero text with sparkles, more than the two fonts above, and any color or pixel value typed directly inside a component instead of a token.

### 8.6 Urdu and Arabic text

Install no extra fonts in v1. Use the font stack `'Archivo', system-ui, 'Noto Naskh Arabic', 'Noto Nastaliq Urdu', sans-serif`. Set `line-height: 1.7` on elements that show user-typed text so Urdu letters are not clipped, and use `dir="auto"` as Part 3 says.

## Part 9. Screens

### 9.1 App shell and login

Routes use `HashRouter`: `/` (Today), `/day/:dateKey`, `/calendar`, `/tasks`, `/more`, `/more/settings`, `/more/habits`, `/more/domains`, `/more/holidays`, `/more/streak`, `/more/backup`.

Login: email, password, and two buttons, Sign in and Create account. Plain error messages. A note: "You need internet once on each device to sign in." Firebase keeps the session on the device, so reopening the app offline goes straight in. Until `onAuthStateChanged` fires the first time, show a plain paper-colored screen (no spinner).

A `useToday()` hook returns today's DateKey and updates it when the date changes while the app is open (check every 30 seconds).

### 9.2 Today and Day Map (`/` and `/day/:dateKey`)

Top to bottom:

1. **Date row:** the long date, a "Today" tag when relevant, previous and next arrows, a "Go to today" button on other days, and a small menu "Day type" with Auto, College day, Off day (this stores a `DayOverride` with the matching template key for that date, using the `ramadan-` variant when Ramadan is active).
2. **Prayer strip:** Fajr, Dhuhr, Asr, Maghrib, Isha with times. On today the next prayer is highlighted with a countdown such as "Maghrib in 1h 12m".
3. **Day progress bar:** text like "3 of 7 done, 62%". Hidden if no tasks.
4. **Daily Goals:** a horizontally scrolling row of cards for today's habit instances. Each shows the title, a bar, `1500 / 3000 ml`, and the habit's quick-add buttons plus Done. Tapping the card opens the Task sheet.
5. **Not in a room yet:** only if there are unplaced tasks for this date. Each row has a "Place" button that opens a room picker.
6. **The map:** rooms in order, with prayer markers placed between them by time.
7. **Backlog button:** "Backlog (N)" opens a sheet. Each row shows the title, "2 of 6 left · 3 days old" and a "Plan for this day" button that opens the room picker.

**Behavior.** Tapping a task opens the **Task sheet**: title, domain, priority, progress text, then the buttons Done, Half (if allowed), Custom (a number field and Add) and Undo last. Secondary actions: Edit, Move to another room (the list includes "No room"), Plan for another day (or Unplan), and Delete (with a custom confirm dialog, never `window.confirm`). Tapping "Add task" in a room opens the New Task form with the date and room already filled. Sealed rooms do nothing when tapped. Opening any date today or later makes sure that date's habit instances exist (Part 5, daily goal instances). **Past dates are read-only**: the add and place buttons are disabled with the text "This day is over".

### 9.3 Calendar (`/calendar`)

A month grid with weeks starting Monday and arrows for previous and next month. Each cell shows the day number, a holiday marker with the name shortened, a count of tasks planned that day (mono), a small mark if the day has an override, and an outline on today. Tapping a cell opens `/day/:dateKey`. The counts come from the month range listener in Part 5.

### 9.4 Tasks (`/tasks`)

Three tabs. **Open:** one-off tasks not done and planned today or later. **Backlog:** from `backlogOf`. **Done:** tasks whose `doneAt` is within the last 14 days (listener: `where('doneAt', '>=', cutoffMs)`). Filter chips for domain and priority. An "Add task" button in the header.

**Task form fields:** Title (required, 1 to 120 characters). Domain (chips). Priority (High, Medium, Low). "How much counts as done?": a target number (above 0) and a unit chosen from Check, %, Items, Pages, Minutes, ml, Custom (short text, 12 characters at most). The default is 1 Check. Planned date (optional). Room (only the open rooms of that date's template, and disabled until a date is chosen). Notes.

### 9.5 More (`/more`)

A plain list of links: Settings, Habits, Domains, Holidays, Streak, Backup.

**Habits screen:** list with edit, pause and delete. The form has title, domain, priority, target and unit, seven weekday toggles, and quick-add amounts (comma-separated numbers). Pausing or deleting a habit never deletes instances that already exist.

**Domains and Holidays screens:** simple lists with add, rename or recolor, and delete. A domain that still has tasks cannot be deleted. Show "Reassign its tasks first".

### 9.6 Settings (`/more/settings`)

Sections: **College** (start time, end time, weekday toggles). **Ramadan** (start date, 29 or 30 days, Taraweeh minutes, with the hint "Enter the date after the moon sighting announcement. Ramadan is expected around early to mid February 2027."). **Prayer** (latitude and longitude with Lahore as default, a minute adjustment per prayer, today's computed times as a preview, the azan sound switch with its note from 7.3). **Theme** (three swatches). **Clock check:** at app start and every 30 minutes while online, send a `HEAD` request with `cache: 'no-store'` to the app's own address, compare its `Date` header with `Date.now()`, and if the difference is more than 120 seconds show a banner: "This device's clock is off by about N minutes. Fix it in your system settings." If the request fails (offline), say nothing.

### 9.7 Streak (`/more/streak`)

**Starting out.** An empty state with a button "Start a counter". Fields: label (default "Streak"), start date (default today), and where to keep it: **This device only (recommended)**, selected by default, or **Sync across devices**. A note under the choice: "Synced data is stored on Google's servers under your account."

**Main view.** The current day count large, in mono. Under it, in one row: Best, Total clean days, Urges handled. Two buttons: "I have an urge" (primary) and "Log a slip" (secondary). A small History list of events. Milestone notices at 3, 7, 14, 30, 60, 90, 180 and 365 days, each shown once per counter (remember in `localStorage`).

**Urge sheet.** Shows the urge plan (the list in `settings.urgePlan`), a 10-minute countdown, and two buttons: "I got through it" (logs an `urge` event) and "I slipped" (asks to confirm, then logs a `relapse`). Default plan lines: "Stand up and leave the room.", "Make wudu.", "Do 20 push-ups.", "Go outside or call someone.", "Open your next task and do five minutes." The plan is editable in this screen.

**Tone.** After a slip, show only: "Streak reset. Your best is X days and you have Y clean days in total. Start again." No scolding, no exclamation marks, no drama.

**Neutral label.** In lists and navigation the counter appears only under its label, with a generic icon.

**PIN (optional).** A switch "Lock this screen with a PIN" (4 to 6 digits). Store `SHA-256(salt + pin)` and the salt in `localStorage` (`daymap.pin.hash`, `daymap.pin.salt`). The screen re-locks when you leave it and after 2 minutes idle. A "Forgot PIN" button removes the PIN and keeps the data. Say honestly in the UI: "This PIN is a speed bump, not strong security."

**Storage.** All reads and writes go through `src/data/counterRepo.ts`, which exposes `subscribe`, `createCounter`, `addEvent`, `deleteEvent`, and `setStorage`. Local counters live in `localStorage['daymap.counters.v1']`. Synced ones live in Firestore (Part 5). `setStorage` copies everything to the other side, then removes it from the first (confirm first).

### 9.8 Backup (`/more/backup`)

**Export** downloads one JSON file: `{ version: 1, exportedAt, settings, domains, habits, tasks, logs, holidays, dayOverrides, counters, counterEvents }`. The counters section includes local-only counters, so they are not lost. **Import** reads a file, checks `version === 1`, shows how many items it holds, asks to confirm, then writes in batches of 400 documents by id. Import never deletes anything. Import is the **one place** where a plain `progress` value may be written (it restores exact saved state).

## Part 10. Build steps (the prompts you paste)

Every step below has the same shape: who does what first, the prompt to paste, and a checklist you run yourself. Always paste the **Standard Opening** first, then the step prompt.

### The Standard Opening (paste before every step prompt)

```text
You are building DayMap, an offline-first planner PWA. The complete specification is in docs/SPEC.md.
Before you write any code: (1) read Part 3 "Golden rules" completely and obey every rule; (2) read PROGRESS.md; (3) read the other Parts named below, completely, not just skimming.
Do ONLY the step described below, nothing extra. When you finish, STOP, list the files you created or changed, and print the Done-when checklist with PASS or FAIL beside each line. Then append your notes to PROGRESS.md. Do not start the next step.
If anything is unclear or two instructions conflict, stop and ask one specific question.
```

### Step 1. Scaffold, PWA shell and Firebase hookup

**Model:** cheaper is fine. **Read:** Parts 3, 4.

**Human does first (about 15 minutes):**

1. Go to the Firebase console and create a project named `daymap`. Turn Google Analytics off.
2. Build, Authentication, Get started, Sign-in method: enable **Email/Password**.
3. Build, Firestore Database, Create database, production mode. Pick the nearest Asia region (for example Mumbai). The region cannot be changed later.
4. Firestore, Rules tab: paste the rules from Part 5 and press Publish.
5. Project settings (the gear), Your apps, Web (`</>`): register an app named `daymap` (skip Hosting for now) and keep the config values handy for `.env.local`.
6. Put `icon-192.png` and `icon-512.png` in the project's `public/` folder once the AI creates it.

**Prompt:**

```text
STEP 1: Scaffold, PWA shell and Firebase hookup. Read Parts 3 and 4.
1. In the current (empty) project folder, create a Vite React TypeScript project (template react-ts). If the command asks questions, choose the plain options. Keep TypeScript strict.
2. Install exactly: react-router-dom@6, firebase, zustand, lucide-react, adhan, @fontsource/archivo, @fontsource/ibm-plex-mono, and dev packages vite-plugin-pwa and vitest. Do not install @dnd-kit yet.
3. Create the folder structure and file names from Part 4. New files may be empty unless this step says otherwise. Create PROGRESS.md with a heading and the line "Step 1 started".
4. Write src/data/firebase.ts exactly as shown in Part 4. Create .env.local with the four empty keys and make sure .gitignore contains .env.local.
5. Configure vite-plugin-pwa with the manifest values and file glob from Part 4. If the icon PNGs are missing, tell the human to add them.
6. Make App.tsx a HashRouter with one route that shows the text "DayMap" on a plain page. Add the viewport meta tag with viewport-fit=cover to index.html. At startup call navigator.storage.persist().
7. Add the package scripts from Part 4.
Do not build any other screen or feature.
```

**Done when:**

- [ ] `npm run dev` shows a page that says DayMap.
- [ ] `npm run build` ends with zero errors.
- [ ] After `npm run preview`, DevTools, Application, Manifest shows no errors, and reloading with Offline ticked still opens the page.
- [ ] `.env.local` is in `.gitignore` and holds your four real Firebase values.
- [ ] The browser console shows no Firebase errors.

### Step 2. Design system

**Model:** cheaper is fine. **Read:** Parts 3, 8.

**Prompt:**

```text
STEP 2: Design system. Read Parts 3 and 8 completely. No Firebase, no data, no real screens in this step.
1. Create src/ui/tokens.css, themes.css (Paper, Ink, Moss) and base.css using exactly the tokens and values in Part 8.2. Import the fonts from @fontsource with only the weights listed there.
2. Add the inline theme script to index.html and a setTheme(name) helper that sets data-theme on <html> and saves the choice to localStorage under daymap.theme.
3. Build these components in src/ui/components, one per file, following Part 8.3: Button (primary, secondary, danger), Chip, Field (input, select and textarea with label and error text), Sheet, ConfirmDialog, ProgressBar, ProgressRing, Toast with an exported showErrorToast(message) function, SyncChip (visual only, takes a state prop), and AppLayout with the phone bottom tab bar and the desktop sidebar from Part 8.4 (tabs Today, Calendar, Tasks, More, pointing at placeholder pages).
4. Create src/ui/icons.ts with the key-to-icon map from Part 8.3.
5. Add a /styleguide route that shows every component and variant, with a theme switcher at the top and a sample Urdu line (یہ ایک ٹیسٹ ہے) inside a field and inside a title.
```

**Done when:**

- [ ] The styleguide looks right in all three themes, and there is no flash of the wrong theme on reload.
- [ ] Searching the components folder finds no `#` color codes and no `box-shadow`.
- [ ] At 375 px width nothing scrolls sideways.
- [ ] Pressing Tab shows a clear focus outline on every control.
- [ ] The Urdu line is right-to-left and not clipped.
- [ ] With your system's "reduce motion" setting on, nothing animates.

### Step 3. Pure logic with tests

**Model: your strongest.** **Read:** Parts 3, 6, 7.

**Prompt:**

```text
STEP 3: Pure logic with tests. Read Parts 3, 6 and 7. No screens and no Firebase in this step.
Create src/lib/time.ts, prayer.ts, templates.ts, progress.ts and streaks.ts exactly as specified in Parts 6 and 7, each with a matching .test.ts file that contains every test listed in those Parts. templates.ts must also export defaultTemplates holding the four templates from the Part 6.3 tables with the exact room ids, names, kinds and times, and pickTemplateKey and resolveTemplate as specified. Use the code in Part 6 as given. Do not change the prayer calculation method, the Hanafi setting or the +5 hour offset.
When done, run the whole test suite three times: normally, with TZ=UTC, and with TZ=Asia/Karachi (PowerShell: $env:TZ='UTC'; npm test). Report all three results.
```

**Done when:**

- [ ] `npm test` passes normally, with `TZ=UTC` and with `TZ=Asia/Karachi`.
- [ ] Every test named in Parts 6 and 7 exists (skim the test file names).
- [ ] `npm run build` passes.
- [ ] Nothing in `src/lib` imports React or Firebase.
- [ ] The banned date functions from Part 3 rule 8 appear only inside `prayer.ts`.

The prayer times themselves are checked against your masjid timetable in Step 7, when you can see them on screen.

### Step 4. Firebase data layer, sign-in, seeding and app shell

**Model: your strongest.** **Read:** Parts 3, 4, 5, 9.1.

**Prompt:**

```text
STEP 4: Firebase data layer, sign-in, seeding and app shell. Read Parts 3, 4, 5 and 9.1. Use the components from Step 2.
1. Write src/data/types.ts exactly from Part 5.
2. Write src/data/auth.ts with signUp(email, password), signIn(email, password), signOut(), and an onAuthChange(callback) wrapper.
3. Write src/data/repo.ts with: reportError; subscribe functions for settings, domains, habits, holidays and dayOverrides (each takes uid, a data callback and an error callback, and returns an unsubscribe function); and save functions for settings, domain, habit, holiday and day override. Follow the Query rules in Part 5. Write functions return void and handle errors with reportError. Never await a write.
4. Write src/data/seed.ts and src/data/seed/holidays-pk.json exactly as in Part 5.
5. Write hooks in src/hooks: useAuth, useSettings, useDomains, useHabits, useHolidays, useDayOverrides.
6. Build the Login screen and the app shell from Part 9.1: AppLayout with the four tabs, the SyncChip wired as in Part 5 (Offline, Syncing, Synced), and all routes from Part 9.1 pointing at simple placeholder pages. Temporary: on the More page, list the domain names read from Firestore so the human can verify sync.
7. Save the rules from Part 5 as firestore.rules.
Do not write task or log functions yet.
```

**Done when:**

- [ ] Create an account. In the Firebase console you see `users/<your id>/settings/main`, six domains and the holidays.
- [ ] Sign out and sign in again. The six domain names show on the More page.
- [ ] With DevTools Offline ticked, reload while signed in. The app opens, still signed in, and the chip says Offline.
- [ ] Signing in on a second browser or phone shows the same domains.
- [ ] Searching the project shows `firebase/` imported only inside `src/data/`.

### Step 5. Tasks

**Model:** cheaper is fine. **Read:** Parts 3, 5, 7.1, 8, 9.4.

**Prompt:**

```text
STEP 5: Tasks. Read Parts 3, 5, 7.1, 8 and 9.4.
1. In src/data/repo.ts add createTask, updateTask, deleteTask, logProgress, undoLastLog and planTask exactly following the Write patterns in Part 5, using computeDoneAt from src/lib/progress.ts. Add the subscriptions subscribeTasksForDate, subscribeOpenOneOffs, subscribeTasksInRange, subscribeRecentDone and subscribeRecentLogs using only the queries allowed in Part 5. Add hooks useTasksForDate, useOpenOneOffs, useRecentLogs and useRecentDone.
2. Build the Tasks screen from Part 9.4: three tabs (Open, Backlog, Done), domain and priority filter chips, and an Add task button.
3. Build TaskForm with every field in Part 9.4 EXCEPT the Room field (that comes in Step 7), with validation. Build the Task sheet with Done, Half (only when allowed), Custom amount, Undo last, Edit and Delete (with ConfirmDialog).
4. Use the helpers from src/lib/progress.ts for all progress maths. Do not repeat that maths in components.
```

**Done when:**

- [ ] Add "Physics numericals", target 6, unit Items. Log 4 with Custom: it shows 2 left. Undo last: it shows 6 left again. Done: it shows complete.
- [ ] Edit the target from 6 to 10 on a finished task: it reopens with the right remainder.
- [ ] Delete asks for confirmation.
- [ ] With DevTools Offline ticked, add a task and log progress. The screen updates instantly and never freezes. Go online and it appears on your second device.
- [ ] On two devices, both offline, log +1 on the same task each. After both reconnect the total is 2.
- [ ] A task whose planned date is yesterday appears in the Backlog tab with its age and its remainder.

### Step 6A. Habits and Daily Goals

**Model:** cheaper is fine. **Read:** Parts 3, 5, 8, 9.2 (item 4), 9.5.

**Prompt:**

```text
STEP 6A: Habits and Daily Goals. Read Parts 3, 5, 8, 9.2 (item 4) and 9.5.
1. In repo.ts add ensureHabitInstances(uid, dateKey, habits) following the daily goal instance rule in Part 5: fixed id habitId_dateKey, setDoc with merge true, never include progress, only for active habits whose daysOfWeek includes that date's weekday, only when dateKey is today or later.
2. Build the Habits screen and HabitForm from Part 9.5.
3. Build a DailyGoals component: horizontally scrolling cards with title, bar, amount text such as 1500 / 3000 ml, the habit's quick-add buttons, and Done. Tapping a card opens the existing Task sheet.
4. Make a temporary Today screen showing the long date and DailyGoals only. Call ensureHabitInstances when it opens.
```

**Done when:**

- [ ] The seeded Water card shows on Today. The +250 and +500 buttons update the bar and the text. Undo works.
- [ ] Opening Today on two devices creates one Water instance, not two (check the Firebase console).
- [ ] A paused habit creates no instance for the next day.
- [ ] Yesterday's unfinished Water does not appear in Backlog.

### Step 6B. Settings, Domains and Holidays

**Model:** cheaper is fine. **Read:** Parts 3, 5, 8, 9.5, 9.6.

**Prompt:**

```text
STEP 6B: Settings, Domains and Holidays. Read Parts 3, 5, 8, 9.5 and 9.6.
1. Build the Settings screen with every section in Part 9.6 (College, Ramadan, Prayer, Theme, Clock check). The Prayer section shows today's computed times using prayerTimesMs. Add a Test azan button that for now only shows the toast "Azan test arrives in Step 10".
2. Theme: choosing a theme saves it to Settings and to localStorage (daymap.theme) and applies at once.
3. Build the Domains screen and the Holidays screen from Part 9.5. A domain that still has tasks cannot be deleted.
4. Build the clock check as a small component in the app shell exactly as written in Part 9.6.
5. Validate inputs: times as HH:mm, latitude -90 to 90, longitude -180 to 180, prayer adjustments -30 to 30 minutes, Taraweeh 20 to 240 minutes.
```

**Done when:**

- [ ] Changing the college start time survives a reload and shows on your second device.
- [ ] The theme persists across reloads with no flash.
- [ ] The prayer preview changes when you change an adjustment.
- [ ] A holiday you add appears in the list, and deleting a domain that has tasks is refused.
- [ ] Offline, every setting is still editable.
- [ ] With your PC clock set 5 minutes wrong and the app online, the clock banner appears (set the clock back afterwards).

### Step 7. The Day Map

**Model: your strongest.** **Read:** Parts 3, 5, 6, 7, 8, 9.2.

**Prompt:**

```text
STEP 7: The Day Map, the heart of the app. Read Parts 3, 5, 6, 7, 8 and 9.2 completely.
1. Write the hook useDay(dateKey). From settings, holidays and the day override it picks the template with pickTemplateKey, computes prayer times with prayerTimesMs, resolves rooms with resolveTemplate, loads that date's tasks, and returns { templateKey, rooms, prayers, tasksByRoom, unplaced, progress } using groupByRoom and dayProgress.
2. Build Today (/) and Day (/day/:dateKey) as one shared DayScreen. Build every item in Part 9.2 in the order listed there: date row with the Day type menu, prayer strip with next-prayer countdown, day progress, Daily Goals (reuse the Step 6A component), the "Not in a room yet" tray, the map, and the Backlog sheet.
3. Build RoomCard (open and sealed variants), RoomDoor, PrayerMarker, NowTag, RoomPicker and DayTypeMenu, following Part 8.3 exactly.
4. Add the Room field to TaskForm (open rooms of the chosen date only). The Add task row inside a room opens the form with date and room already filled. Add Move and Plan another day to the Task sheet.
5. Opening any date that is today or later calls ensureHabitInstances. Past dates are read-only with the text "This day is over". useToday must move the app to the new date at midnight.
6. Click-to-place only. Do NOT add drag and drop (that is Step 10).
```

**Done when:**

- [ ] Today's Fajr and Maghrib match your masjid timetable within 2 or 3 minutes (if not, set an adjustment in Settings; do not change the code).
- [ ] The Day type menu switches between all four templates, and the rooms match the Part 6.3 tables.
- [ ] In Settings set the Ramadan start date to today. Sehri, Iftar and Isha & Taraweeh rooms appear. Changing the Taraweeh minutes moves where Night Lab starts.
- [ ] Sealed rooms do nothing when tapped and have no Add row.
- [ ] Place a task in Study Hall, move it to Evening Room, then unplace it. It appears under "Not in a room yet".
- [ ] The NOW tag sits on the right room.
- [ ] A task whose date is yesterday shows in the Backlog sheet with the right remainder. "Plan for this day" pulls it in with its progress kept.
- [ ] Everything above works with DevTools Offline ticked, with no freezing.
- [ ] On a past day the add and place buttons are disabled.

### Step 8. Calendar

**Model:** cheaper is fine. **Read:** Parts 3, 5, 6, 8, 9.3.

**Prompt:**

```text
STEP 8: Calendar. Read Parts 3, 5, 6, 8 and 9.3.
1. Build the Calendar screen from Part 9.3 using monthGrid from src/lib/time.ts. Listen to the visible month with subscribeTasksInRange and re-subscribe when the month changes. Use holidays and day overrides from the existing hooks.
2. Each cell shows the day number, the holiday marker with a shortened name, the planned task count in the mono font, an override mark, and an outline on today. Tapping a cell navigates to /day/:dateKey.
3. Add previous and next month arrows and a "This month" button.
4. Do not change the Day Map.
```

**Done when:**

- [ ] Holidays you added show on the right dates.
- [ ] A day's count matches the number of tasks planned on that day.
- [ ] Tapping a day opens its Day Map, and the back button returns to the same month.
- [ ] A Day type override set on the Day Map shows as a mark on that date.
- [ ] Works offline.

### Step 9. Streak counter

**Model:** cheaper is fine. **Read:** Parts 3, 5, 7.2, 8, 9.7.

**Prompt:**

```text
STEP 9: Streak counter. Read Parts 3, 5, 7.2, 8 and 9.7 completely.
1. Write src/data/counterRepo.ts with subscribe, createCounter, addEvent, deleteEvent and setStorage as described in Part 9.7. Local counters live in localStorage under daymap.counters.v1. Synced counters use Firestore collections counters and counterEvents. Follow Golden rules 5 and 6.
2. Build the Streak screen exactly as in Part 9.7: the empty state with the storage choice (local-only selected by default), the main view with current, best, total clean days and urges handled (all from streakStats), the History list, and milestone notices.
3. Build the Urge sheet with the editable plan, the 10-minute countdown, and the two buttons.
4. Build the optional PIN lock exactly as in Part 9.7, including re-lock on leaving the screen and after 2 minutes idle.
5. Use only the calm wording given in Part 9.7. No exclamation marks, no emojis, no scolding.
On the More page and everywhere else, the counter appears only under its label with a generic icon.
```

**Done when:**

- [ ] Create a counter with a start date 31 days ago. It shows 31 current, 31 best, 31 total.
- [ ] Log a slip: current becomes 0, best and total stay.
- [ ] Log an urge: urges handled goes up by one, and the 10-minute timer runs.
- [ ] A local-only counter does not appear anywhere in the Firebase console.
- [ ] Switching to Sync makes it appear in Firebase and on your second device (after the confirm dialog).
- [ ] The PIN locks the screen when you leave and after 2 minutes idle.
- [ ] Nothing visible outside the Streak screen reveals what the counter is for.

### Step 10. Drag and drop, azan and polish

**Model:** cheaper is fine. **Read:** Parts 3, 7.3, 8, 9.2.

**Prompt:**

```text
STEP 10: Drag and drop, azan sound and polish. Read Parts 3, 7.3, 8 and 9.2.
1. Install only @dnd-kit/core. Make task rows draggable and open rooms plus the "Not in a room yet" tray droppable on the Day Map. Use MouseSensor, TouchSensor with activationConstraint { delay: 250, tolerance: 5 } so scrolling still works on a phone, and KeyboardSensor. A drop calls planTask(taskId, dateKey, zoneId). Sealed rooms and past days are not drop targets. Click-to-place must keep working exactly as before.
2. Build the azan behaviour from Part 7.3 as a component in the app shell, and make the Test azan button in Settings fire it immediately. If public/audio/azan.mp3 is missing, the banner still works and the sound part is skipped with a visible note in Settings.
3. Polish pass: every list has an empty state (one sentence and one button), every screen renders from cached data while offline, every listener has an error callback with a toast, and every user-text element and input has dir="auto".
Do not add any other feature.
```

**Done when:**

- [ ] On your phone you can drag a task into another room, and the page still scrolls normally when you swipe elsewhere.
- [ ] Dropping on a sealed room does nothing.
- [ ] The Test azan button shows the banner, plays your file if you supplied one, and Stop works.
- [ ] With the file missing, nothing crashes.
- [ ] Search the project for `await` before any `setDoc`, `updateDoc`, `addDoc`, `deleteDoc` or `batch.commit` and find none in UI code.

### Step 11. Backup, deploy and phone install

**Model:** cheaper is fine. **Read:** Parts 3, 9.8, 11.

**Human does first:**

1. In PowerShell run `npm install -g firebase-tools`, then `firebase login`.
2. In the project folder run `firebase init hosting`. Choose your existing `daymap` project. Public directory: `dist`. Single-page app: **Yes**. Automatic GitHub builds: **No**. If it asks to overwrite `dist/index.html`: **No**.

**Prompt:**

```text
STEP 11: Backup and deploy. Read Parts 3, 9.8 and 11.
1. Build the Backup screen exactly as in Part 9.8 (export, then import with validation, a count preview, a confirm dialog and batches of 400). Include local-only counters in the export.
2. Edit firebase.json so hosting serves the dist folder, rewrites every path to /index.html, and sends the header Cache-Control: no-cache for /sw.js.
3. Add a README.md with the three commands to publish: npm run build, then firebase deploy --only hosting, and how to roll back with the Firebase console.
4. Do not run the deploy. Tell the human to run it.
```

**Then you:** run `npm run build` and `firebase deploy --only hosting`. Open the live address on your phone.

**Done when:**

- [ ] Export downloads a JSON file, and importing it on a clean account restores your tasks, habits and settings.
- [ ] The live site opens on your phone and laptop. Install it (Android Chrome: menu, Install app. iPhone Safari: Share, Add to Home Screen).
- [ ] Every item in Part 11 passes.

## Part 11. Final checks (you, on real devices) and troubleshooting

### The checklist

**A. Offline**

- [ ] Install on both devices, switch on airplane mode, open the app. Today, Calendar and Tasks all show your data.
- [ ] Add a task and log progress while offline. It never freezes.

**B. Sync**

- [ ] Add a task on the laptop. It shows on the phone within a few seconds.
- [ ] Phone offline: add a task and log water. Reconnect. The laptop shows both.
- [ ] Both devices offline, each logs +250 ml on Water. After reconnecting the total is +500.

**C. Time**

- [ ] Fajr and Maghrib match your masjid timetable within 2 or 3 minutes.
- [ ] Leave the app open across midnight. It moves to the new day by itself.
- [ ] Set your PC clock 10 minutes wrong while online. The clock banner appears.

**D. Day Map**

- [ ] All four day types render and match Part 6.3.
- [ ] A task planned for yesterday and not finished sits in the Backlog with its remainder kept.
- [ ] Daily goals never appear in the Backlog.

**E. Ramadan**

- [ ] With the start date set to today, Sehri, Iftar and Taraweeh rooms appear. The day before the start date shows the normal template.

**F. Streak**

- [ ] Nothing outside the Streak screen reveals its purpose. The local-only counter is absent from the Firebase console. The PIN works.

**G. Safety**

- [ ] Export a backup, and keep a copy somewhere other than the phone.
- [ ] Firebase console, Usage: reads and writes per day are far below the free limits (50,000 reads and 20,000 writes).

**H. Design**

- [ ] No item from the banned list in Part 8.5 is present. At 375 px nothing scrolls sideways. Urdu text looks right.

### When something breaks

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| The screen freezes while offline | Someone used `await` on a Firestore write | Golden rule 5. Remove the `await`, add `.catch(reportError)` |
| "The query requires an index" | A `where` on one field mixed with `orderBy` on another | Part 5 Query rules. Sort in code |
| "Missing or insufficient permissions" | Rules not published, or not signed in | Re-paste the Part 5 rules and press Publish |
| Water count wrong after syncing | Something wrote `progress` directly | Golden rule 7. Use `increment()` |
| Prayer times a few minutes off | Normal difference between timetables | Use Settings, Prayer adjustments |
| Old version shows after a deploy | The service worker has not updated yet | Close every tab and reopen the app |
| A weird error after `npm install` | Version conflict | Stop. Copy the full error and bring it to me. Never use `--force` |
| The date is wrong on a new PC | System clock or time zone | Fix the Windows clock. The app already uses Pakistan time |

## Part 12. After v1 (Phase 2)

Do not start any of this until v1 has run cleanly for about two weeks. Before any AI touches Phase 2, write it as a new Part in this document with the same level of detail as Parts 5 to 9. Candidates, in rough order of value:

1. **Daily-completion streak and XP.** A Duolingo-style streak for "finished all high-priority tasks today", XP per finished task, levels, and a badge shelf (7, 30, 100 days, first full Day Map, a month of Manzil, and so on). Keep it separate from the private counter.
2. **Sunday front page.** A newspaper-style weekly recap: what you finished, what slid into the Backlog, and your streaks.
3. **Rotating themes.** More editions, picked weekly or by you, using the same token system.
4. **Hifz tracker.** A dedicated Sabaq, Sabqi and Manzil screen. Any Quran or hadith text must come from a verified file that you supply. The AI must never type it from memory.
5. **Daily ayah card** from that same verified file.
6. **Board exam mode.** Countdown to each paper, and per-subject progress.
7. **Template editor.** Rename rooms and change their times from inside the app.
8. **Real reminders.** Wrap the same code with Capacitor for native alarms and notifications while the app is closed.
