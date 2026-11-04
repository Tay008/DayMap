# DayMap - Full Documentation

## Project Overview

**DayMap** is an offline-first PWA planner that visualizes each day as a map of "rooms" (time chunks). Built for a single user to manage tasks, habits, prayers, and streaks with real-time sync across devices. Timezone is always Asia/Karachi (UTC+5, no DST).

- **Tech Stack**: Vite + React + TypeScript (strict), React Router DOM v6 (HashRouter), Firebase Auth + Firestore with offline persistence, Zustand (UI state only), adhan (prayer times), lucide-react icons, Vitest for pure logic tests
- **Hosting**: Firebase Hosting
- **Design**: Flat, paper-inspired design with three themes (Paper, Ink, Moss). No shadows/gradients except hatched pattern for sealed rooms. Urdu/Arabic text support with `dir="auto"`.
- **Offline-first**: Works fully offline after first login, syncs when connection returns

## Project Structure

```
daymap/
├── docs/SPEC.md           # Master specification (1083 lines)
├── PROGRESS.md            # Build log of all completed steps
├── firestore.rules        # Firestore security rules
├── public/                # Icons, optional azan.mp3
├── src/
│   ├── main.tsx, App.tsx  # Entry point, routing, auth gate
│   ├── config/app.ts      # App constants
│   ├── lib/               # PURE logic - no React/Firebase (tested with Vitest)
│   │   ├── time.ts        # Pakistan time helpers (DateKey in YYYY-MM-DD)
│   │   ├── prayer.ts      # Prayer times via adhan (Karachi method, Hanafi)
│   │   ├── templates.ts   # Day templates and room resolution
│   │   ├── progress.ts    # Task progress, backlog calculation
│   │   └── streaks.ts     # Streak statistics
│   ├── data/              # ONLY place that imports from firebase/*
│   │   ├── firebase.ts    # Firebase init with offline persistence
│   │   ├── auth.ts        # Auth wrappers, re-exports User type
│   │   ├── types.ts       # All data types
│   │   ├── subscribe.ts   # Generic Firestore subscription helpers
│   │   ├── tasks.ts       # Task CRUD + subscriptions
│   │   ├── repo.ts        # Settings/domains/habits/etc + re-exports
│   │   ├── seed.ts        # First-login seeding
│   │   └── counterRepo.ts # Streak counter storage (local + synced)
│   ├── hooks/             # React hooks wrapping data layer
│   ├── state/ui.ts        # Zustand store (UI state only)
│   ├── ui/                # Design system
│   │   ├── tokens.css, themes.css, base.css
│   │   ├── theme.ts       # Theme switching
│   │   ├── icons.ts       # Icon key mapping
│   │   └── components/    # Reusable components (one per file, <250 lines)
│   └── screens/           # Page components
```

## Golden Rules (Must Follow)

1. **One step at a time** - Only do what's specified, stop when done
2. **Read before writing** - Read SPEC.md parts mentioned, check PROGRESS.md
3. **Stay inside stack** - Only approved packages
4. **Never invent facts** - Use adhan library, don't guess prayer times/holidays
5. **Never `await` Firestore writes in UI** - Fire and forget with `.catch(reportError)`, let listeners update
6. **Only `src/data/` imports from `firebase/*`** - Screens/components use hooks/functions from data layer
7. **`progress` only via `increment()` in batches with logs** - Never write plain numbers; read as `progress ?? 0`
8. **Dates are `DateKey` strings from `src/lib/time.ts`** - Banned: `getHours`, `getDate`, `getDay`, `toLocaleDateString`, `toLocaleTimeString`, `new Date(someString)`. Exception: `prayer.ts` adapter only
9. **TypeScript strict** - No `any`, no `@ts-ignore`, no error-silencing casts
10. **Pure logic in `src/lib/` gets Vitest tests** - Don't weaken tests, fix code
11. **Never block on network** - Render from cache, all listeners have error callbacks
12. **Small files** - One component per file, under 250 lines
13. **Design law** - Flat, tokens only, no shadows/gradients/blur/purple/neon/emojis
14. **Plain UI words** - Calm, no exclamation marks/shaming, especially in Streak
15. **Text direction** - User text, inputs, textareas need `dir="auto"`
16. **No git commands** - Human handles git
17. **Ask if unsure** - Stop and ask specific question
18. **Keep PROGRESS.md honest** - Log everything at end of step

## Build History

### Step 1: Scaffold, PWA shell, Firebase hookup
- **Built**: Vite + React + TS scaffold, PWA with vite-plugin-pwa, Firebase init with offline persistence, folder structure
- **Files**: `src/data/firebase.ts`, `.env.local`, `firestore.rules`, base structure
- **Notes**: Fixed NODE_ENV issues, used Rollup WASM fallback for old CPU. App boots with "DayMap"

### Step 2: Design system
- **Built**: Tokens, themes (Paper/Ink/Moss), base styles, theme helper with localStorage persistence, icon map, 10 UI components
- **Components**: Button, Chip, Field, Sheet, ConfirmDialog, ProgressBar, ProgressRing, Toast (with `showErrorToast`), SyncChip, AppLayout
- **Verified**: All themes work, no flash, focus outlines, Urdu RTL support, reduced motion respected

### Step 3: Pure logic with tests
- **Built**: `time.ts`, `prayer.ts`, `templates.ts`, `progress.ts`, `streaks.ts` with full test coverage
- **Tests**: 32 tests passing in normal/UTC/Asia-Karachi timezones
- **Approach**: Pure functions, structural typing for compatibility with future types

### Step 4: Firebase data layer, sign-in, seeding, app shell
- **Built**: Types, auth wrappers, repo layer, seeding logic, hooks, Login screen, app shell with routes
- **Firebase**: Connected to `daymap-30f74` (Firestore asia-south1), Email/Password auth enabled
- **Seeding**: Creates 6 domains, default settings, Water habit (3000ml daily), 5 Pakistani holidays
- **Verified**: Account creation, sync across devices, offline persistence

### Step 5: Tasks
- **Built**: Task CRUD in repo, hooks, Tasks screen (Open/Backlog/Done tabs), TaskForm, TaskSheet
- **Patterns**: `logProgress`/`undoLastLog` use `writeBatch` with `increment()`, `createTask` sets `doneAt: null` with no `progress`
- **Verified**: Progress logging, undo, done/half/custom amounts, delete confirmation, offline sync, multi-device

### Step 6A: Habits and Daily Goals
- **Built**: `ensureHabitInstances`, Habits screen, HabitForm, DailyGoals component
- **Logic**: Instances created with fixed id `${habitId}_${dateKey}`, only for today/later, only if not exists (never overwrites finished), no `progress` field
- **Verified**: Daily goals on Today screen, pause/resume, not in backlog

### Step 6B: Settings, Domains, Holidays
- **Built**: Settings screen (College/Ramadan/Prayer/Theme), Domains/Holidays management, ClockCheck banner
- **Features**: Theme persistence, prayer time preview with adjustments, domain deletion protection (checks tasks), clock skew detection via HTTP Date header
- **Verified**: All settings sync, offline editing works

### Regression Audit (after Step 6B)
- **Fixed 2 violations**:
  1. **Rule 6**: Hooks imported from `firebase/*` directly - moved to data layer (`data/auth.ts` re-exports `User`, added `repo.subscribeSyncPending`)
  2. **Rule 12**: `repo.ts` was 349 lines - split into `subscribe.ts`, `tasks.ts`, slim `repo.ts` with re-exports
- **Verified**: All 12 routes, all flows, offline mode - zero errors, 35/35 tests passing

### Step 7: The Day Map (In Progress)
- **Built so far**:
  - `lib/time.ts`: Added `nowMs()`
  - `lib/time.test.ts`: Added tests for `nowMs()`
  - `data/repo.ts`: Added `deleteDayOverride()`
  - `hooks/useNowMs.ts`: Ticking "now" for countdowns
  - `hooks/useDay.ts`: Composes settings/holidays/overrides/tasks into day data (picks template, resolves rooms, groups tasks)
  - `hooks/useTasksForDate.ts`: Fixed to handle empty dateKey
  - Components: `NowTag`, `RoomDoor`, `PrayerMarker`, `RoomCard` with sealed/open variants
- **Remaining**: DayScreen, RoomPicker, DayTypeMenu, integrate into routes, add Room field to TaskForm, handle past dates readonly

## Key Design Patterns

### Data Layer
- All Firestore operations in `src/data/`
- Writes fire-and-forget with `.catch(reportError)`
- Subscriptions return unsubscribe functions
- Generic `subscribeDocument`/`subscribeCollection` helpers
- `reportError` shows toast

### Task Progress
```ts
// logProgress
const batch = writeBatch(db);
batch.set(doc(db, `users/${uid}/logs/${logId}`), {id, taskId, amount, dateKey: todayKey(), at: now});
batch.update(doc(db, `users/${uid}/tasks/${task.id}`), {
  progress: increment(amount), // Firestore increment
  doneAt: computeDoneAt(newProgress, task.target, task.doneAt, now),
  updatedAt: now,
});
batch.commit().catch(reportError);
```
- `increment()` prevents lost writes on multi-device offline
- Logs provide audit history
- `computeDoneAt` in `lib/progress.ts` sets `doneAt` when reaching target, null otherwise
- Undo deletes log and does `increment(-amount)`

### Daily Goal Instances
```ts
const id = `${habitId}_${dateKey}`;
const instance: Task = { id, title, domainId, priority, kind: 'daily_goal', target, unit, 
  plannedDate: dateKey, zoneId: null, notes: '', habitId, doneAt: null, createdAt: now, updatedAt: now };
// never include progress
getDoc(ref).then(s => { if (!s.exists()) setDoc(ref, instance, {merge: true}).catch(reportError); });
```
- Fixed deterministic IDs prevent duplicates
- Never overwrite existing (respects completed instances)
- Only created for today or future, only if habit active and day of week matches
- Never go to backlog

### Templates & Day Map
- 4 templates: normal-college, normal-off, ramadan-college, ramadan-off
- Rooms have kinds: open (accept tasks), sleep/school/travel/meal/worship (sealed)
- `resolveTemplate` normalizes times, clamps, removes invalid, sorts, merges overlaps
- `pickTemplateKey` considers Ramadan dates, college days, holidays, overrides
- Tasks with missing room go to `unplaced` tray
- Prayer markers between rooms

### Time Handling
- All dates as `DateKey = 'YYYY-MM-DD'` in Pakistan time
- `dateKeyFromMs` uses UTC with +5h offset: `new Date(ms + OFFSET_MS).toISOString().slice(0,10)`
- `addDays`, `diffDays`, `weekdayOf` work on DateKeys
- `formatClock`, `formatDateLong` use `Intl.DateTimeFormat` with `timeZone: 'Asia/Karachi'`

## Testing Strategy

- **Pure logic** (`src/lib/`): Vitest unit tests, run in normal/UTC/Asia-Karachi to ensure timezone independence
- **E2E**: Manual testing with headless Chrome (agent-browser) against real Firebase
- **Build/Lint**: Must pass before marking step done
- **Offline testing**: DevTools offline mode + production build PWA

Current state: **35/35 tests passing**, build succeeds, lint has 1 soft warning (Toast.tsx exports both component and function - required by spec)

## Firebase Configuration

Project: `daymap-30f74` (asia-south1)
- Auth: Email/Password enabled
- Firestore: Rules allow only owner access under `users/{uid}/**`
- Hosting configured (dist/, SPA rewrites)

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # TypeScript check + Vite build
npm run preview  # Preview production build
npm test         # Run Vitest tests
npm run lint     # Oxlint
```

## Notable Deviations

1. **repo.ts split** - Grew beyond 250 lines, split into modules (complies with rule 12)
2. **Firebase imports in hooks** - Fixed to go through data layer (complies with rule 6)
3. **Domains screen** - Uses whole-collection tasks listener to check deletability (not in original query list but required)
4. **ensureHabitInstances** - Does existence check before write (prevents overwriting completed instances)
5. **Clock check** - Uses `Date.parse` on HTTP Date header (rule 8 says "not `new Date(someString)`", Date.parse is different)
6. **Toast** - Exports both component and `showErrorToast` (required by spec, causes lint warning)

## Current Status & Handoff For Next Model

### What's Done
- **Steps 1-6B Complete**: Full auth, data layer, tasks, habits, settings/domains/holidays, with regression audit fixes applied
- **Tests**: 35/35 passing in normal/UTC/Asia-Karachi
- **Build**: Clean (`npm run build` exits 0)
- **Lint**: 1 soft warning only (Toast.tsx - required by spec)
- **Firebase**: Connected to `daymap-30f74`, tested end-to-end

### What's In Progress - Step 7 (The Day Map)
**Already built:**
- `hooks/useDay.ts` - Composes day data from settings/holidays/overrides/tasks
- `hooks/useNowMs.ts` - Ticking time for countdowns
- `hooks/useTasksForDate.ts` - Fixed for empty dateKey
- `data/repo.ts` - Added `deleteDayOverride()`
- `lib/time.ts` - Added `nowMs()`
- Components: `NowTag`, `RoomDoor`, `PrayerMarker`, `RoomCard` (open/sealed variants)

**Still needs to be built (in order):**
1. **DayScreen** (`src/screens/Day.tsx` + `Day.css`) - Shared screen for `/` and `/day/:dateKey`. Must have: date row with Day type menu, prayer strip with next-prayer countdown, day progress bar, DailyGoals, "Not in a room yet" tray, room map, Backlog button
2. **RoomPicker** - For placing tasks into rooms
3. **DayTypeMenu** - To override template per day (stores in `dayOverrides`)
4. **Update TaskForm** - Add Room field (only open rooms for selected date). When opening from "Add task" in a room, pre-fill date and room
5. **Update TaskSheet** - Add "Move to another room" and "Plan for another day"/"Unplan" actions
6. **Wire up routes** in `App.tsx` - Replace placeholder Today/Day routes with real DayScreen
7. **Handle past dates** - Read-only mode, disable add/place buttons with "This day is over" text
8. **Call ensureHabitInstances** - When opening any date that is today or later
9. **useToday hook** - Must update at midnight

### Remaining Steps
- **Step 8**: Calendar (month grid, task dots, holiday markers, day overrides)
- **Step 9**: Streak counter (local + synced, PIN, urge timer)
- **Step 10**: Drag and drop (@dnd-kit/core), azan sound, polish pass
- **Step 11**: Backup/import/export, Firebase deploy

### Critical Files To Read First (For Any New Model)
Before touching ANY code for Step 7 or beyond:
1. **`docs/SPEC.md`** - Parts 3 (Golden Rules), 6 (Time/Prayers/Templates), 7 (Logic), 8 (Design), 9.2 (Day Map spec) - READ COMPLETELY
2. **`PROGRESS.md`** - Understand exact current state and all decisions made
3. **`src/hooks/useDay.ts`** - See how data is composed
4. **`src/lib/templates.ts`** - Understand the 4 templates and resolver
5. **`src/lib/progress.ts`** - All progress/backlog/grouping helpers
6. **`src/data/repo.ts`** - All available functions

### Rules To Never Break
- **Rule 6**: ONLY `src/data/` imports from `firebase/*`. Never import from firebase in hooks/components/screens
- **Rule 5**: Never `await` Firestore writes in UI. Fire and attach `.catch(reportError)`
- **Rule 7**: `progress` only changed via `increment()` in batches with logs. Never write plain numbers
- **Rule 8**: Use `DateKey` strings from `time.ts`. No banned date functions
- **Rule 12**: Keep files under 250 lines. Split if larger
- **Rule 9**: TypeScript strict, no `any`/`@ts-ignore`/error-silencing casts
- **Rule 13**: Follow design system strictly - tokens only, no shadows/gradients/blur/purple/neon

### Verification Before Declaring Done
After ANY changes, always run:
```bash
npm run build  # Must exit 0
npm test        # Must be 35/35 (or more if tests added)
npm run lint    # Check for new errors (warnings may be acceptable if pre-existing)
```

For UI changes, test with agent-browser against the dev server. For data changes, verify against real Firebase.

### Common Pitfalls To Avoid
- Don't add features not in the step
- Don't refactor unrelated code
- Don't use `window.confirm`/`alert` - use `ConfirmDialog`
- Don't create new files unless absolutely necessary
- Don't install packages not in the approved list
- Don't forget error callbacks on all `onSnapshot` calls
- Don't put maths in components - use `src/lib/progress.ts` helpers
- Don't hardcode colors/pixel values - use CSS tokens
- Remember daily goals never go to backlog
- Remember past dates are read-only
- Remember sealed rooms are not tappable and have no add row
