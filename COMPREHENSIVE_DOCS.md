# DayMap - Comprehensive Technical Documentation

> This document provides a complete, in-depth understanding of the DayMap project - every step, every technology, every pattern, and everything needed to continue development without breaking the codebase.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Golden Rules (Non-Negotiable)](#golden-rules-non-negotiable)
5. [Data Model](#data-model)
6. [Time & Date System](#time--date-system)
7. [Prayer Times](#prayer-times)
8. [Day Templates & Rooms](#day-templates--rooms)
9. [Pure Logic Layer](#pure-logic-layer)
10. [Data Layer Architecture](#data-layer-architecture)
11. [Hooks](#hooks)
12. [Design System](#design-system)
13. [Build History - All Steps](#build-history---all-steps)
14. [Current State & Step 7](#current-state--step-7)
15. [Remaining Work](#remaining-work)
16. [Development Workflow](#development-workflow)
17. [Testing & Verification](#testing--verification)
18. [Critical Patterns & Gotchas](#critical-patterns--gotchas)
19. [Handoff Guide for Next Model](#handoff-guide-for-next-model)

---

## Project Overview

**DayMap** is an offline-first PWA planner that visualizes each day as a map of "rooms" (time chunks), similar to a Resident Evil floor plan. It's designed for a single user to manage their daily life with tasks, habits, prayers, and streak tracking, with seamless sync across devices.

### Core Philosophy
- **Room-based planning**: Time is divided into rooms (chunks), tasks are placed in rooms as plans (not appointments)
- **Offline-first**: Works fully offline after first login, syncs automatically when online
- **Pakistan-focused**: Timezone is always Asia/Karachi (UTC+5, no DST), prayer times use Karachi calculation method
- **Calm design**: Flat paper aesthetic, no gamification in main UI, streak counter is hidden/neutral
- **Single user**: Data isolated per user under `users/{uid}/`

### Key Features (Full Scope)
1. Email/password auth with offline persistence
2. Live sync with status chip (Synced/Syncing/Offline)
3. Day Map with 4 templates, prayer markers, "NOW" indicator
4. Tasks with progress tracking (Done/Half/Custom/Undo)
5. Habits/daily goals with quick-add
6. Backlog (calculated, not stored) for unfinished one-offs
7. Calendar with month view
8. Prayer times with adjustments, Ramadan mode
9. Streak counter (local or synced, PIN-protected)
10. Domains management
11. Settings (college, Ramadan, prayer, theme)
12. Three themes (Paper, Ink, Moss)
13. Backup export/import
14. PWA installable

---

## Technology Stack

### Dependencies (Exact Versions)
```json
{
  "dependencies": {
    "@fontsource/archivo": "^5.3.0",      // Primary font
    "@fontsource/ibm-plex-mono": "^5.3.0", // Monospace for times
    "adhan": "^4.4.6",                    // Prayer times calculation
    "firebase": "^13.1.0",                // Auth + Firestore
    "lucide-react": "^1.66.0",            // Icons
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "react-router-dom": "^6.30.6",        // HashRouter
    "zustand": "^5.0.16"                  // UI state only
  },
  "devDependencies": {
    "@types/node": "^24.19.2",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "oxlint": "^1.89.0",                 // Linter
    "typescript": "~7.0.2",               // Strict mode
    "vite": "^8.3.5",
    "vite-plugin-pwa": "^2.0.0",          // PWA
    "vitest": "^5.0.5"                    // Testing
  },
  "overrides": {
    "rollup": "npm:@rollup/wasm-node@4.67.3" // For old CPUs
  }
}
```

### Key Choices & Rationale
- **HashRouter**: Works offline and on any host without server config
- **Firebase with offline persistence**: Enables true offline-first
- **No date library**: Custom `time.ts` helpers for Pakistan time
- **adhan**: Standard Islamic prayer time calculation
- **Zustand only for UI state**: Never for synced data
- **Vitest for lib only**: Pure logic testing

---

## Project Structure

```
daymap/
├── docs/SPEC.md                  # Master spec (1083 lines) - READ THIS
├── PROGRESS.md                   # Build log
├── DOCUMENTATION.md              # Overview docs
├── COMPREHENSIVE_DOCS.md         # This file
├── firestore.rules               # Security rules
├── firebase.json                 # Firebase hosting config
├── .firebaserc                   # Firebase project config
├── .env.local                    # Firebase credentials (gitignored)
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── index.html                    # Has inline theme script
│
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── audio/azan.mp3           # Optional
│
└── src/
    ├── main.tsx                  # Entry, imports base CSS, calls navigator.storage.persist()
    ├── App.tsx                   # Router, auth gate, seeding, layout
    ├── vite-env.d.ts
    │
    ├── config/
    │   └── app.ts                # App name/constants
    │
    ├── lib/                      # PURE LOGIC - no React, no Firebase
    │   ├── time.ts               # DateKey helpers, Pakistan time
    │   ├── time.test.ts
    │   ├── prayer.ts             # Prayer times via adhan
    │   ├── prayer.test.ts
    │   ├── templates.ts          # Room templates & resolution
    │   ├── templates.test.ts
    │   ├── progress.ts           # Task progress, backlog, grouping
    │   ├── progress.test.ts
    │   ├── streaks.ts            # Streak calculations
    │   ├── streaks.test.ts
    │   └── *.test.ts
    │
    ├── data/                     # ONLY PLACE importing firebase/*
    │   ├── firebase.ts           # Firebase init with offline persistence
    │   ├── auth.ts               # Auth wrappers, re-exports User
    │   ├── types.ts              # All TypeScript types
    │   ├── subscribe.ts          # Generic subscription helpers
    │   ├── tasks.ts              # Task CRUD & queries
    │   ├── repo.ts               # Settings/domains/habits/holidays/overrides + re-exports
    │   ├── seed.ts               # First-login seeding
    │   ├── counterRepo.ts         # Streak counters (local + synced)
    │   ├── types.compat.test.ts   # Compatibility test
    │   └── seed/
    │       └── holidays-pk.json  # Initial holidays
    │
    ├── hooks/                    # React hooks wrapping data layer
    │   ├── useAuth.ts
    │   ├── useSettings.ts
    │   ├── useDomains.ts
    │   ├── useHabits.ts
    │   ├── useHolidays.ts
    │   ├── useDayOverrides.ts
    │   ├── useSyncState.ts
    │   ├── useTasksForDate.ts
    │   ├── useOpenOneOffs.ts
    │   ├── useRecentLogs.ts
    │   ├── useRecentDone.ts
    │   ├── useToday.ts
    │   ├── useAllTasks.ts
    │   ├── useNowMs.ts
    │   └── useDay.ts
    │
    ├── state/
    │   └── ui.ts                 # Zustand store (UI only)
    │
    ├── ui/
    │   ├── tokens.css            # Spacing, type, radius, borders
    │   ├── themes.css            # Paper/Ink/Moss themes
    │   ├── base.css              # Global styles, focus, motion
    │   ├── theme.ts              # setTheme helper
    │   ├── icons.ts              # Icon key mapping
    │   └── components/           # One per file, <250 lines
    │       ├── AppLayout.tsx/css
    │       ├── Button.tsx/css
    │       ├── Chip.tsx/css
    │       ├── Field.tsx/css
    │       ├── Sheet.tsx/css
    │       ├── ConfirmDialog.tsx/css
    │       ├── ProgressBar.tsx/css
    │       ├── ProgressRing.tsx/css
    │       ├── Toast.tsx/css      # Exports ToastHost + showErrorToast
    │       ├── SyncChip.tsx/css
    │       ├── TaskRow.tsx/css
    │       ├── TaskForm.tsx/css
    │       ├── TaskSheet.tsx/css
    │       ├── HabitForm.tsx/css
    │       ├── DailyGoals.tsx/css
    │       ├── ClockCheck.tsx/css
    │       ├── NowTag.tsx/css
    │       ├── RoomDoor.tsx/css
    │       ├── PrayerMarker.tsx/css
    │       ├── RoomCard.tsx/css
    │       └── ...
    │
    └── screens/
        ├── Boot.tsx/css
        ├── Login.tsx/css
        ├── Today.tsx/css          # Temporary, will be replaced by Day
        ├── Calendar.tsx/css
        ├── Tasks.tsx/css
        ├── More.tsx/css
        ├── Settings.tsx/css
        ├── Habits.tsx/css
        ├── Domains.tsx/css
        ├── Holidays.tsx/css
        ├── Streak.tsx/css
        ├── Styleguide.tsx/css
        └── Placeholder.tsx/css
```

---

## Golden Rules (Non-Negotiable)

Every model MUST follow these without exception:

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **1. One step at a time** | Only do the step specified, nothing extra. Stop when done. | Critical |
| **2. Read before writing** | Read SPEC.md parts mentioned + PROGRESS.md completely | Critical |
| **3. Stay inside stack** | Only approved packages, no `--force`/`--legacy-peer-deps` | Critical |
| **4. Never invent facts** | Use adhan for prayers, don't guess holidays/dates | Critical |
| **5. Never `await` Firestore writes in UI** | Fire and `.catch(reportError)`, let listeners update | Critical - causes freezing offline |
| **6. Only `src/data/` imports `firebase/*`** | Screens/hooks/components use data layer only | Critical - architectural rule |
| **7. `progress` only via `increment()` in batch with log** | Never write plain numbers, read as `progress ?? 0` | Critical - prevents data loss |
| **8. Dates are `DateKey` from `time.ts`** | Banned: getHours/getDate/getDay/toLocaleDateString/toLocaleTimeString/new Date(someString). Exception: prayer.ts adapter | Critical |
| **9. TypeScript strict** | No `any`, no `@ts-ignore`, no error-silencing casts. Build must pass with 0 errors | Critical |
| **10. Pure logic in `src/lib/` gets tests** | Vitest tests required, don't weaken tests | Critical |
| **11. Never block on network** | Render from cache, all listeners have error callbacks | Critical |
| **12. Small files** | One component per file, under 250 lines. Split if bigger | Critical |
| **13. Design law** | Flat, tokens only, no shadows/gradients/blur/purple/neon/emojis. Only hatch for sealed rooms | Critical |
| **14. Plain UI words** | Calm, no exclamation marks/shaming, especially Streak | Critical |
| **15. Text direction** | User text/inputs/textareas need `dir="auto"` | Critical |
| **16. No git commands** | Human handles git | Critical |
| **17. Ask if unsure** | Stop and ask specific question if conflict/unclear | Critical |
| **18. Keep PROGRESS.md honest** | Log what was built, files changed, issues, uncertainties | Critical |

---

## Data Model

All data lives under `users/{uid}/` in Firestore.

### Collections/Paths
| Path | Type | Notes |
|------|------|-------|
| `settings/main` | `Settings` | Single document |
| `domains/{id}` | `Domain` | Categories |
| `habits/{id}` | `Habit` | Recurring habits |
| `tasks/{id}` | `Task` | One-offs and daily goal instances |
| `logs/{id}` | `Log` | Progress history |
| `holidays/{id}` | `Holiday` | Holiday dates |
| `dayOverrides/{dateKey}` | `DayOverride` | Per-day template override (doc id = DateKey) |
| `counters/{id}` | `Counter` | Streak counters (if synced) |
| `counterEvents/{id}` | `CounterEvent` | Streak events (if synced) |

### Type Definitions (from `src/data/types.ts`)

```typescript
export type DateKey = string; // 'YYYY-MM-DD', Pakistan time
export type Priority = 1 | 2 | 3; // 1 = high
export type TemplateKey = 'normal-college' | 'normal-off' | 'ramadan-college' | 'ramadan-off';

export interface Domain { 
  id: string; name: string; colorIndex: 1|2|3|4|5|6|7; icon: string; order: number; 
}

export interface Task {
  id: string;
  title: string; // 1-120 chars
  domainId: string;
  priority: Priority;
  kind: 'one_off' | 'daily_goal';
  target: number; // > 0
  unit: string; // 'check' | '%' | 'items' | 'pages' | 'min' | 'ml' | custom (max 12)
  plannedDate: DateKey | null; // null = unplanned (Backlog)
  zoneId: string | null; // room id from template
  notes: string;
  habitId: string | null; // set on daily_goal instances
  progress?: number; // ONLY via increment(), read as progress ?? 0
  doneAt: number | null; // ms when first reached target, always written
  createdAt: number;
  updatedAt: number;
}

export interface Log { 
  id: string; taskId: string; amount: number; dateKey: DateKey; at: number; 
}

export interface Habit {
  id: string; title: string; domainId: string; priority: Priority;
  target: number; unit: string;
  daysOfWeek: number[]; // 0=Sunday ... 6=Saturday
  quickAdds: number[]; // e.g. [250, 500]
  active: boolean; createdAt: number; updatedAt: number;
}

export interface Settings {
  collegeStart: number; // minutes since midnight, default 480
  collegeEnd: number; // default 840
  collegeDays: number[]; // default [1,2,3,4,5]
  ramadanStart: DateKey | null;
  ramadanDays: 29 | 30; // default 30
  taraweehMinutes: number; // default 90
  lat: number; lng: number; // default 31.5204, 74.3587 (Lahore)
  adjust: Record<PrayerName, number>; // minutes to add, default all 0
  azanSound: boolean; // default false
  theme: 'paper' | 'ink' | 'moss';
  urgePlan: string[];
}

export interface Holiday { id: string; dateKey: DateKey; name: string; }
export interface DayOverride { dateKey: DateKey; templateKey: TemplateKey; }
export interface Counter { id: string; label: string; startDateKey: DateKey; localOnly: boolean; createdAt: number; }
export interface CounterEvent { id: string; counterId: string; type: 'relapse' | 'urge'; dateKey: DateKey; at: number; note: string; }
```

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Query Rules (Critical)
- Never combine `where` on one field with `orderBy` on different field (needs index, fails silently)
- Fetch then sort in code
- Allowed queries:
  - Day Map: `where('plannedDate', '==', dateKey)`
  - Backlog source: `where('kind', '==', 'one_off')` AND `where('doneAt', '==', null)` (two equality filters OK)
  - Calendar month: `where('plannedDate', '>=', monthStart)` AND `where('plannedDate', '<=', monthEnd)` (same field twice OK)
  - Recent logs: `where('dateKey', '>=', yesterdayKey)`
  - Everything else (domains, habits, holidays, overrides, settings): listen to whole collection
- Document IDs: habits/domains/holidays use `crypto.randomUUID()` except seeded domains use fixed IDs (`study`, `webdev`, `cyber`, `quran`, `health`, `chores`)

### Write Patterns

**Create task:**
```typescript
const now = Date.now();
const id = crypto.randomUUID();
const task = { id, ...input, doneAt: null, createdAt: now, updatedAt: now };
// Never include progress
setDoc(doc(db, `users/${uid}/tasks/${id}`), task).catch(reportError);
```

**Log progress:**
```typescript
const now = Date.now();
const newProgress = (task.progress ?? 0) + amount;
const logId = crypto.randomUUID();
const batch = writeBatch(db);
batch.set(doc(db, `users/${uid}/logs/${logId}`), { id: logId, taskId: task.id, amount, dateKey: todayKey(), at: now });
batch.update(doc(db, `users/${uid}/tasks/${task.id}`), {
  progress: increment(amount),
  doneAt: computeDoneAt(newProgress, task.target, task.doneAt, now),
  updatedAt: now,
});
batch.commit().catch(reportError);
```

**Undo last log:**
```typescript
const now = Date.now();
const newProgress = Math.max(0, (task.progress ?? 0) - log.amount);
const batch = writeBatch(db);
batch.delete(doc(db, `users/${uid}/logs/${log.id}`));
batch.update(doc(db, `users/${uid}/tasks/${task.id}`), {
  progress: increment(-log.amount),
  doneAt: computeDoneAt(newProgress, task.target, task.doneAt, now),
  updatedAt: now,
});
batch.commit().catch(reportError);
```

**Daily goal instance:**
```typescript
const id = `${habitId}_${dateKey}`;
const instance: Task = {
  id, title: habit.title, domainId: habit.domainId, priority: habit.priority,
  kind: 'daily_goal', target: habit.target, unit: habit.unit,
  plannedDate: dateKey, zoneId: null, notes: '', habitId: habit.id,
  doneAt: null, createdAt: now, updatedAt: now,
  // NEVER include progress
};
getDoc(ref).then(s => {
  if (s.exists()) return; // never overwrite
  setDoc(ref, instance, { merge: true }).catch(reportError);
}).catch(reportError);
```

**Sync status:** Listen to tasks collection with `includeMetadataChanges: true`, check `snapshot.metadata.hasPendingWrites`. States: Offline (navigator.onLine false), Syncing (pending writes), Synced (neither).

---

## Time & Date System

**Timezone:** Always Asia/Karachi (UTC+5, no DST). Fixed offset.

### `src/lib/time.ts`
```typescript
export type DateKey = string;
const OFFSET_MS = 5 * 60 * 60 * 1000;

export function dateKeyFromMs(ms: number): DateKey {
  return new Date(ms + OFFSET_MS).toISOString().slice(0, 10);
}
export function todayKey(): DateKey { return dateKeyFromMs(Date.now()); }
export function nowMs(): number { return Date.now(); } // for use in hooks

export function minutesOfDay(ms: number): number {
  const d = new Date(ms + OFFSET_MS);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export function dayStartMs(key: DateKey): number {
  const [y, m, d] = parts(key);
  return Date.UTC(y, m - 1, d) - OFFSET_MS;
}

export function toTimeInput(min: number): string { /* HH:mm */ }
export function fromTimeInput(value: string): number | null { /* minutes */ }

function parts(key: DateKey): [number, number, number] { /* split */ }

export function addDays(key: DateKey, n: number): DateKey {
  const [y, m, d] = parts(key);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function diffDays(a: DateKey, b: DateKey): number {
  const t = (k: DateKey) => { const [y, m, d] = parts(k); return Date.UTC(y, m - 1, d); };
  return Math.round((t(a) - t(b)) / 86400000); // a minus b
}

export function weekdayOf(key: DateKey): number {
  const [y, m, d] = parts(key);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
}

export function formatClock(ms: number): string {
  // Asia/Karachi, 12h format
}

export function formatMinutes(min: number): string {
  // For 0-1440, UTC-based formatting
}

export function formatDateLong(key: DateKey): string {
  // "Saturday, 31 October 2026", UTC noon
}

export function monthGrid(year: number, month: number): DateKey[][] {
  // Weeks starting Monday
}
```

### Tests Required
- `dateKeyFromMs(Date.UTC(2026,9,31,18,59,59))` = `2026-10-31`, +1s = `2026-11-01`
- `addDays('2027-02-28', 1)` = `2027-03-01`, leap year works
- `diffDays('2026-11-01', '2026-10-31')` = `1`
- `weekdayOf('2026-10-31')` = `6` (Saturday)
- Must pass in normal, TZ=UTC, TZ=Asia/Karachi

---

## Prayer Times

### `src/lib/prayer.ts`
```typescript
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { minutesOfDay, type DateKey } from './time';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerDay = Record<PrayerName, number>; // absolute ms

export function prayerTimesMs(key: DateKey, lat: number, lng: number,
                              adjust: Record<PrayerName, number>): PrayerDay {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d); // ALLOWED HERE ONLY
  const params = CalculationMethod.Karachi();
  params.madhab = Madhab.Hanafi; // Asr
  const pt = new PrayerTimes(new Coordinates(lat, lng), date, params);
  const at = (t: Date, n: number) => t.getTime() + n * 60000;
  return {
    fajr: at(pt.fajr, adjust.fajr), sunrise: at(pt.sunrise, adjust.sunrise),
    dhuhr: at(pt.dhuhr, adjust.dhuhr), asr: at(pt.asr, adjust.asr),
    maghrib: at(pt.maghrib, adjust.maghrib), isha: at(pt.isha, adjust.isha),
  };
}

export function prayerMinutes(p: PrayerDay): Record<PrayerName, number> {
  return { fajr: minutesOfDay(p.fajr), sunrise: minutesOfDay(p.sunrise), 
           dhuhr: minutesOfDay(p.dhuhr), asr: minutesOfDay(p.asr), 
           maghrib: minutesOfDay(p.maghrib), isha: minutesOfDay(p.isha) };
}

export function nextPrayer(nowMs: number, day: PrayerDay): { name: PrayerName, time: number } {
  // Find next prayer today, else fajr tomorrow
}
```

### Rules
- Use Karachi calculation method, Hanafi madhab
- Default coordinates Lahore: 31.5204, 74.3587
- Adjustments per prayer in minutes (-30 to 30)
- Only `new Date(y,m-1,d)` allowed in prayer.ts (banned elsewhere)
- Must match masjid timetable within 2-3 minutes
- Azan only plays while app is open, max 2 minutes after prayer time

---

## Day Templates & Rooms

### Types
```typescript
export type RoomKind = 'open' | 'sleep' | 'school' | 'travel' | 'meal' | 'worship';
export type TimeRef =
  | { t: 'clock'; min: number }
  | { t: 'prayer'; p: PrayerName; off: number; plusTaraweeh?: boolean }
  | { t: 'college'; which: 'start' | 'end'; off: number };
export interface ZoneDef { id: string; name: string; kind: RoomKind; start: TimeRef; end: TimeRef; }
export interface ResolvedZone extends ZoneDef { startMin: number; endMin: number; }
export type TemplateKey = 'normal-college' | 'normal-off' | 'ramadan-college' | 'ramadan-off';
```

### Rules
- **Only `kind: 'open'` accept tasks** - All others are sealed
- Sealed rooms: sleep, school, travel, meal, worship
- Room IDs shared across templates (tasks keep room when day type changes)
- If task's roomId doesn't exist in template → goes to unplaced tray

### Template Resolution Algorithm
```typescript
export function resolveTemplate(zones, prayerMin, settings): ResolvedZone[] {
  // 1. Convert to minutes
  const resolved = zones.map(z => ({
    ...z,
    startMin: clamp(timeRefToMin(z.start, prayerMin, settings)),
    endMin: clamp(timeRefToMin(z.end, prayerMin, settings)),
  }));
  // 2. Remove if end <= start
  const valid = resolved.filter(z => z.endMin > z.startMin);
  // 3. Sort by start
  valid.sort((a,b) => a.startMin - b.startMin);
  // 4. Trim overlaps
  const out = [];
  let previousEnd = 0;
  for (const zone of valid) {
    const startMin = Math.max(zone.startMin, previousEnd);
    if (zone.endMin <= startMin) continue;
    out.push({ ...zone, startMin });
    previousEnd = zone.endMin;
  }
  return out;
}
```

### Template Selection
```typescript
export function pickTemplateKey(key, s, holidays, override?) {
  if (override) return override;
  const since = s.ramadanStart === null ? -1 : diffDays(key, s.ramadanStart);
  const ramadan = since >= 0 && since < s.ramadanDays;
  const college = s.collegeDays.includes(weekdayOf(key)) && !holidays.has(key);
  if (ramadan) return college ? 'ramadan-college' : 'ramadan-off';
  return college ? 'normal-college' : 'normal-off';
}
```

### Templates (Exact)
**normal-college:** sleep-a(00:00-fajr), dawn(fajr-cs-60, open), prep(cs-60-cs, travel), college(cs-ce, school), recovery(ce-asr, open), study(asr-maghrib, open), evening(maghrib-isha, open), night(isha-22:30, open), sleep-b(22:30-24:00, sleep)

**normal-off:** sleep-a, dawn(fajr-sunrise+120), morning(sunrise+120-dhuhr), midday(dhuhr-asr), study(asr-maghrib), evening(maghrib-isha), night(isha-22:30), sleep-b

**ramadan-college:** sleep-a(00:00-fajr-60), sehri(fajr-60-fajr, meal), dawn(fajr-cs-60), prep, college, recovery(ce-asr), study(asr-maghrib-30), iftar(maghrib-30-maghrib+30, meal), evening(maghrib+30-isha), taraweeh(isha-isha+T, worship), night(isha+T-23:00), sleep-b(23:00-24:00)

**ramadan-off:** Similar to normal-off but with sehri/iftar/taraweeh added

---

## Pure Logic Layer

### `src/lib/progress.ts`
```typescript
export interface ProgressTask {
  id: string; target: number; progress?: number;
  plannedDate: DateKey | null; kind: 'one_off' | 'daily_goal';
  priority: 1|2|3; createdAt: number; doneAt: number | null; zoneId: string | null;
}

export function progressOf(task): number { return task.progress ?? 0; }
export function isDone(task): boolean { return progressOf(task) >= task.target; }
export function remaining(task): number { return Math.max(0, task.target - progressOf(task)); }
export function fraction(task): number { return Math.min(1, progressOf(task) / task.target); }

export function computeDoneAt(progress, target, existing, now = Date.now()): number | null {
  return progress >= target ? (existing ?? now) : null;
}

export function doneAmount(task): number { return remaining(task); } // For Done button
export function halfAmount(task): number { return Math.min(remaining(task), Math.ceil(task.target * 0.5)); } // Only if target >= 2

export function dayProgress(tasks): DayProgress | null {
  if (tasks.length === 0) return null;
  const total = tasks.length;
  const done = tasks.filter(isDone).length;
  const sum = tasks.reduce((acc, t) => acc + fraction(t), 0);
  return { percent: Math.round((sum / total) * 100), done, total };
}

export function backlogOf<T extends ProgressTask>(openOneOffs: T[], today: DateKey): (T & { ageDays: number })[] {
  return openOneOffs
    .filter(t => t.kind === 'one_off' && !isDone(t) && (t.plannedDate === null || t.plannedDate < today))
    .map(t => ({
      ...t,
      ageDays: t.plannedDate !== null ? diffDays(today, t.plannedDate) : diffDays(today, dateKeyFromMs(t.createdAt))
    }))
    .sort((a,b) => a.priority - b.priority || b.ageDays - a.ageDays);
}

export type TasksByRoom = Record<string, ProgressTask[]>;
export function groupByRoom(tasks: ProgressTask[], zones: { id: string }[]): TasksByRoom {
  const ids = new Set(zones.map(z => z.id));
  const out: TasksByRoom = { unplaced: [] };
  for (const zone of zones) out[zone.id] = [];
  for (const task of tasks) {
    const key = task.zoneId !== null && ids.has(task.zoneId) ? task.zoneId : 'unplaced';
    out[key].push(task);
  }
  const byPriorityThenAge = (a,b) => a.priority - b.priority || a.createdAt - b.createdAt;
  for (const key of Object.keys(out)) out[key].sort(byPriorityThenAge);
  return out;
}
```

**Key rules:**
- Daily goals NEVER enter backlog
- Done/Half never go past target
- Custom amount can go past target
- Past dates are read-only

### `src/lib/streaks.ts`
```typescript
export function streakStats(counter, events, today) {
  // Get distinct relapse dates between start and today
  const relapseDates = [...new Set(events.filter(e => e.type === 'relapse').map(e => e.dateKey))]
    .filter(d => d >= counter.startDateKey && d <= today).sort();
  
  const lastRelapse = relapseDates.length > 0 ? relapseDates[relapseDates.length - 1] : null;
  const current = diffDays(today, lastRelapse ?? counter.startDateKey);
  // If relapse logged today, current becomes 0
  
  // Calculate best gap
  let best = diffDays(today, lastRelapse ?? counter.startDateKey);
  // Check gaps: start->r1, r1->r2, etc.
  
  // totalClean = days since start - relapse dates before today
  const totalClean = Math.max(0, diffDays(today, counter.startDateKey) - relapseDatesBeforeToday);
  const urges = events.filter(e => e.type === 'urge').length;
  
  return { current, best, totalClean, urges };
}
```

---

## Data Layer Architecture

### Structure
- **`src/data/firebase.ts`** - Initialize app, auth, Firestore with offline persistence
- **`src/data/auth.ts`** - Auth wrappers, re-exports `User` type
- **`src/data/subscribe.ts`** - Generic `reportError`, `subscribeDocument`, `subscribeCollection`
- **`src/data/tasks.ts`** - Task subscriptions and CRUD
- **`src/data/repo.ts`** - Settings/domains/habits/holidays/overrides, seeding helpers, re-exports from subscribe and tasks
- **`src/data/seed.ts`** - First-login seeding
- **`src/data/counterRepo.ts`** - Streak counters

### Firebase Init
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

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

### Repo Exports
`repo.ts` re-exports everything from `./subscribe` and `./tasks`, so existing imports like `import { createTask } from '../data/repo'` still work.

### Error Handling
```typescript
export function reportError(error: unknown): void {
  showErrorToast(error instanceof Error ? error.message : String(error));
}
```
All Firestore writes: `.catch(reportError)`. All listeners must have error callbacks.

---

## Hooks

All hooks wrap the data layer. Never import from `firebase/*` in hooks.

| Hook | Purpose |
|------|---------|
| `useAuth` | Auth state |
| `useSettings` | Settings document |
| `useDomains` | All domains (ordered) |
| `useHabits` | All habits |
| `useHolidays` | All holidays |
| `useDayOverrides` | Day overrides |
| `useSyncState` | Sync status (Offline/Syncing/Synced) |
| `useTasksForDate` | Tasks for specific date |
| `useOpenOneOffs` | Open one-off tasks |
| `useRecentLogs` | Recent logs |
| `useRecentDone` | Recently completed tasks |
| `useToday` | Today's DateKey, updates at midnight |
| `useAllTasks` | All tasks (for domain deletion check) |
| `useNowMs` | Ticking current time (default 30s interval) |
| `useDay` | Composes full day data for a date |

### `useDay` Implementation
```typescript
export function useDay(dateKey: DateKey | null): DayData | null {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const settings = useSettings(uid);
  const holidays = useHolidays(uid);
  const overrides = useDayOverrides(uid);
  const tasks = useTasksForDate(uid, dateKey ?? '');
  
  const holidaySet = useMemo(() => new Set(holidays.map(h => h.dateKey)), [holidays]);
  
  if (!dateKey || !settings) return null;
  
  const match = overrides.find(o => o.dateKey === dateKey);
  const override = match ? match.templateKey : null;
  const templateKey = pickTemplateKey(dateKey, settings, holidaySet, override ?? undefined);
  const prayers = prayerTimesMs(dateKey, settings.lat, settings.lng, settings.adjust);
  const rooms = resolveTemplate(defaultTemplates[templateKey], prayerMinutes(prayers), settings);
  const tasksByRoom = groupByRoom(tasks, rooms);
  
  const since = settings.ramadanStart === null ? -1 : diffDays(dateKey, settings.ramadanStart);
  const ramadan = since >= 0 && since < settings.ramadanDays;
  
  return {
    dateKey, templateKey, override, ramadan, rooms, prayers, tasksByRoom,
    unplaced: tasksByRoom.unplaced ?? [],
    progress: dayProgress(tasks),
  };
}
```

---

## Design System

### Tokens (`src/ui/tokens.css`)
```css
/* Spacing */
--s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px; --s-7: 48px;
/* Type */
--t-xs: 12px; --t-sm: 14px; --t-base: 16px; --t-lg: 20px; --t-xl: 28px; --t-2xl: 40px;
/* Radius */
--r-0: 0; --r-1: 4px;
/* Borders */
--b-thin: 1px; --b-thick: 2px;
/* Tap target */
--tap: 44px;
/* Layout */
--header-h: 56px; --tabbar-h: 56px; --sidebar-w: 220px; --content-max: 560px;
```

### Themes (`src/ui/themes.css`)
| Token | Paper | Ink | Moss |
|-------|-------|-----|------|
| `--bg` | #F4EFE6 | #12110F | #E9EDE3 |
| `--surface` | #FBF8F2 | #1C1B18 | #F5F7F0 |
| `--ink` | #15130F | #F2EDE3 | #14201A |
| `--muted` | #6B6558 | #A39D8F | #5A675F |
| `--line-soft` | #D8D0C0 | #3A3731 | #C9D2C3 |
| `--accent` | #C93C20 | #FF6A45 | #1F6B4A |
| `--accent-ink` | #FFFFFF | #12110F | #FFFFFF |
| `--ok` | #2F7D4F | #6FCF97 | #3C7A2A |
| `--danger` | #B3261E | #FF6B5E | #B3261E |

**Domain colors** (same in all themes): #C93C20, #B8860B, #4F7A3A, #1F7A7A, #2E5EAA, #7A5230, #4B5563

### Theme Switching
- Set `data-theme` on `<html>`
- Save to `localStorage['daymap.theme']`
- Inline script in `index.html` applies before React (no flash)

### Component Rules
- **Button**: Primary (ink bg, surface text), Secondary (transparent, 2px ink border), Danger. Min height 44px, radius 4px. Pressed moves down 1px. Disabled 40% opacity
- **Room card**: 2px ink border, radius 0. Header with name (700) left, time mono muted right. Add row 44px with dashed line
- **Sealed room**: Hatched background `repeating-linear-gradient(45deg, var(--line-soft) 0 1px, transparent 1px 8px)` - ONLY gradient allowed
- **Now room**: 2px accent border + "NOW" tag
- **Prayer marker**: 1px dashed line + mono label
- **Task row**: Left bar (domain color), priority width 3/5/8px. Title wraps 2 lines. Progress ring 28px. Done = line-through muted
- **Sheet**: Slides up 200ms, surface bg, 2px top border, backdrop dim. No shadow
- **Focus**: `outline: 3px solid var(--accent); outline-offset: 2px`
- **Motion**: Only sheet slide (200ms), progress ring/bar (300ms), toast (150ms). Disabled under prefers-reduced-motion

### Layout
- **Phone (<900px)**: Single column, max-width 560px, header 56px, bottom tab bar 56px + safe-area. Tabs: Today, Calendar, Tasks, More
- **Desktop (>=900px)**: 220px sidebar, Today becomes 2 columns (Day Map left, Daily Goals/Backlog/Prayers right)
- **Viewport**: `viewport-fit=cover`

### Banned
Gradients (except hatch), glass/blur, drop shadows on cards/buttons, pill shapes, purple/indigo/neon, emoji as icons, floating blobs, gradient text, bouncing/pulsing, confetti, centered hero with sparkles, >2 fonts, hardcoded colors/pixels in components

### Urdu/Arabic
Font stack: `'Archivo', system-ui, 'Noto Naskh Arabic', 'Noto Nastaliq Urdu', sans-serif`. `line-height: 1.7` on user text. `dir="auto"` everywhere.

---

## Build History - All Steps

### Step 1: Scaffold, PWA shell, Firebase hookup
- Created Vite + React + TS project
- Installed exact dependencies
- Created folder structure
- `src/data/firebase.ts` with offline persistence
- PWA configured with manifest
- HashRouter with "DayMap" placeholder
- `navigator.storage.persist()`
- **Verified**: dev/build/preview work, PWA installs

### Step 2: Design system
- Tokens, themes, base styles
- Theme helper with localStorage
- Icon map
- 10 components (Button, Chip, Field, Sheet, ConfirmDialog, ProgressBar, ProgressRing, Toast, SyncChip, AppLayout)
- `/styleguide` route
- **Verified**: All themes, no flash, focus, Urdu, reduced motion

### Step 3: Pure logic with tests
- `time.ts`, `prayer.ts`, `templates.ts`, `progress.ts`, `streaks.ts` + tests
- 32 tests passing in normal/UTC/Asia-Karachi
- `defaultTemplates` with all 4 templates
- **Verified**: All tests pass, no React/Firebase imports in lib

### Step 4: Firebase data layer, sign-in, seeding, app shell
- `types.ts`, `auth.ts`, `repo.ts`, `seed.ts`
- Hooks for all data
- Login screen, Boot screen
- App shell with all routes (placeholders)
- Seed creates 6 domains, settings, Water habit, holidays
- **Verified**: Account creation, sync, offline reload, multi-device

### Step 5: Tasks
- Task CRUD in `repo.ts`, subscriptions
- `useTasksForDate`, `useOpenOneOffs`, `useRecentLogs`, `useRecentDone`
- Tasks screen (3 tabs), TaskForm, TaskSheet
- Progress logging with batches and increment
- **Verified**: All task flows, undo, offline, multi-device

### Step 6A: Habits and Daily Goals
- `ensureHabitInstances`, `deleteHabit`, `setHabitActive`
- Habits screen, HabitForm
- DailyGoals component
- Temporary Today screen
- **Verified**: Instances created once, pause/resume, not in backlog

### Step 6B: Settings, Domains, Holidays
- Settings screen (all sections)
- Domains and Holidays screens
- ClockCheck component
- `useAllTasks` hook
- `deleteDayOverride` added
- **Verified**: All settings, domain deletion protection, clock check

### Regression Audit (after 6B)
- **Fixed Rule 6**: `useAuth` imported User from firebase/auth → now imports from `data/auth` (re-exported). `useSyncState` imported firestore → uses `subscribeSyncPending` from repo
- **Fixed Rule 12**: Split `repo.ts` (349 lines) into `subscribe.ts`, `tasks.ts`, slim `repo.ts` with re-exports
- **Verified**: 12 routes, all flows, offline - zero errors, 35/35 tests

### Step 7: The Day Map (In Progress)
**Completed:**
- `lib/time.ts`: added `nowMs()`
- `lib/time.test.ts`: added `nowMs()` test
- `data/repo.ts`: added `deleteDayOverride()`
- `hooks/useNowMs.ts`: created (ticking time)
- `hooks/useDay.ts`: created (composes day data)
- `hooks/useTasksForDate.ts`: fixed to handle empty dateKey
- Components: `NowTag.tsx/css`, `RoomDoor.tsx/css`, `PrayerMarker.tsx/css`, `RoomCard.tsx/css`

**TODO:** DayScreen, RoomPicker, DayTypeMenu, update TaskForm/TaskSheet, wire routes, handle past dates readonly, call ensureHabitInstances, implement useToday properly

---

## Current State & Step 7

### Current App.tsx Routes
- `/` → AppLayout with Today screen (temporary)
- `/day/:dateKey` → AppLayout with Placeholder "Day"
- `/calendar` → Calendar
- `/tasks` → Tasks
- `/more` → More
- `/more/settings` → Settings
- `/more/habits` → Habits
- `/more/domains` → Domains
- `/more/holidays` → Holidays
- `/more/streak` → Streak
- `/more/backup` → Placeholder
- `/styleguide` → Styleguide (no auth)

### useDay Hook Returns
```typescript
interface DayData {
  dateKey: DateKey;
  templateKey: TemplateKey;
  override: TemplateKey | null;
  ramadan: boolean;
  rooms: ResolvedZone[];
  prayers: PrayerDay;
  tasksByRoom: TasksByRoom;
  unplaced: Task[];
  progress: DayProgress | null;
}
```

### Step 7 Requirements (From SPEC)
1. `useDay(dateKey)` hook - DONE (partially, need to ensure it works correctly)
2. Today (/) and Day (/day/:dateKey) as one shared DayScreen
3. Build: date row with Day type menu, prayer strip with next-prayer countdown, day progress bar, DailyGoals, "Not in a room yet" tray, map, Backlog sheet
4. RoomCard (open/sealed), RoomDoor, PrayerMarker, NowTag, RoomPicker, DayTypeMenu
5. Add Room field to TaskForm (open rooms only), pre-fill when adding from room
6. Add Move to another room and Plan for another day/Unplan to TaskSheet
7. Opening today/later calls ensureHabitInstances
8. Past dates read-only (disable add/place, "This day is over")
9. useToday must update at midnight
10. Click-to-place only (no drag-drop until Step 10)

### RoomCard Component (Already Built)
- Shows header with name, NOW tag if isNow, time range
- Sealed: hatched bg, shows kind icon, no tasks/add
- Open: shows TaskRows, "Add task" button (disabled if isPast with "This day is over")
- isNow uses accent border

---

## Remaining Work

### Step 7 Completion
**Files to create:**
- `src/screens/Day.tsx` + `Day.css` (main DayScreen)
- `src/ui/components/RoomPicker.tsx` + `RoomPicker.css`
- `src/ui/components/DayTypeMenu.tsx` + `DayTypeMenu.css`
- `src/hooks/useToday.ts` (if not fully implemented)

**Files to modify:**
- `src/App.tsx` - Replace placeholders with Day screen
- `src/ui/components/TaskForm.tsx` - Add room selection
- `src/ui/components/TaskSheet.tsx` - Add move/plan actions
- `src/screens/Tasks.tsx` - May need updates
- `src/data/repo.ts` - May need `moveTask`, `unplanTask` helpers if not present

### Step 8: Calendar
- Build Calendar screen with month grid
- Use `monthGrid` from time.ts
- Subscribe to month range with `subscribeTasksInRange`
- Show holidays, task counts, overrides, today marker
- Navigate to `/day/:dateKey`
- Previous/next month, "This month"

### Step 9: Streak
- `counterRepo.ts` already exists (needs verification)
- Streak screen with empty state, main view, urge sheet
- PIN lock
- Local storage + synced Firestore
- Calm wording, hidden label

### Step 10: Drag and drop, azan, polish
- Install `@dnd-kit/core`
- Draggable tasks, droppable rooms/tray
- Azan sound with banner
- Polish pass

### Step 11: Backup, deploy
- Backup screen (export/import)
- firebase.json config
- README
- Deploy to Firebase Hosting

---

## Development Workflow

### Starting a Session
1. Read `docs/SPEC.md` - especially Parts 3, 6, 7, 8, 9 relevant to current step
2. Read `PROGRESS.md` to see what's done
3. Read this `COMPREHENSIVE_DOCS.md`
4. Check current state with git/status

### Making Changes
1. **Never guess** - look up existing patterns first
2. **Follow golden rules** religiously
3. **Keep files small** - split if approaching 250 lines
4. **Use existing patterns** - copy from similar components
5. **All imports** - follow the data layer rule
6. **Error handling** - all writes caught, all listeners have errors
7. **Tests** - if touching lib, run tests

### Before Finishing
```bash
npm run build    # Must exit 0, zero TS errors
npm test         # All tests must pass
npm run lint     # Check for new errors
```

For UI: test with agent-browser on dev server. For data: test against real Firebase.

### Committing
Human handles git. Just report changes.

---

## Testing & Verification

### Automated
```bash
npm test                    # All tests
TZ=UTC npm test            # Timezone independence
TZ=Asia/Karachi npm test   # Timezone independence
npm run build              # TypeScript + build
npm run lint               # Linting
```

### Manual E2E (as done)
- All routes render with zero errors
- Auth flow works
- Task CRUD, logging, undo
- Habits, pause/resume
- Settings, themes, persistence
- Domains add/delete with protection
- Offline mode on all screens
- Multi-device sync

### Route Sweep
Check all routes: `/`, `/calendar`, `/tasks`, `/more`, `/more/settings`, `/more/habits`, `/more/domains`, `/more/holidays`, `/more/streak`, `/more/backup`, `/day/2026-11-01`, `/styleguide`

---

## Critical Patterns & Gotchas

### Must Remember
1. **Progress**: Always use `increment()` in batch with log. Never write plain numbers. Read as `progress ?? 0`
2. **Writes**: Never `await` in UI. Fire and `.catch(reportError)`
3. **Firebase imports**: ONLY in `src/data/`
4. **Dates**: Use `DateKey` from `time.ts`. No banned functions
5. **Daily goals**: Never in backlog. Fixed ID `${habitId}_${dateKey}`. Never include progress. Check existence before creating
6. **Past dates**: Read-only. Disable add/place with "This day is over"
7. **Sealed rooms**: No tasks, no add button, not tappable
8. **Unplaced tasks**: Go to "Not in a room yet" tray if roomId invalid/missing
9. **Backlog**: Calculated by `backlogOf()`, not stored. Only one_off, not done, unplanned or planned before today
10. **Domain deletion**: Check if any tasks use it (use `useAllTasks`)
11. **Undo**: Only for logs from today/yesterday
12. **Theme**: Applied via inline script in index.html to prevent flash

### Common Mistakes
- Forgetting error callbacks on `onSnapshot`
- Using `new Date(string)` somewhere
- Importing firebase in hooks/components
- Awaiting Firestore writes
- Writing `progress` directly
- Making files over 250 lines
- Adding features not in step
- Using `window.confirm`/`alert`
- Hardcoding colors/pixels

### Firebase Quirks
- Offline persistence can take time to initialize
- `metadata.hasPendingWrites` indicates syncing
- Two devices offline logging same task: both use `increment()`, both count
- Service worker may need reload to pick up new deploy

---

## Handoff Guide for Next Model

### Before Starting Step 7
1. **Read SPEC.md** - Focus on Parts 3, 6, 7, 8, 9.2
2. **Read PROGRESS.md** - See exact history
3. **Read this document** completely
4. **Examine existing code** - `useDay.ts`, `RoomCard.tsx`, `templates.ts`, `progress.ts`
5. **Check current routes** in `App.tsx`

### Step 7 Implementation Order
1. Create `useToday.ts` hook if needed (or check if exists)
2. Create `RoomPicker.tsx` component
3. Create `DayTypeMenu.tsx` component  
4. Create `Day.tsx` screen (shared for `/` and `/day/:dateKey`)
5. Update `TaskForm.tsx` to add room selection
6. Update `TaskSheet.tsx` to add move/plan actions
7. Update `App.tsx` to use Day screen
8. Test thoroughly

### Key Files to Reference
- **Templates**: `src/lib/templates.ts` - exact room definitions
- **Day data**: `src/hooks/useDay.ts` - how it's composed
- **Progress**: `src/lib/progress.ts` - helpers for UI
- **Task form/sheet**: `src/ui/components/TaskForm.tsx`, `TaskSheet.tsx` - follow patterns
- **Existing screens**: Look at Tasks.tsx for patterns

### Testing Checklist for Step 7
- [ ] Today's Fajr/Maghrib match masjid (within 2-3 min)
- [ ] All 4 templates switch correctly
- [ ] Ramadan mode works
- [ ] Sealed rooms not tappable, no add button
- [ ] Place task in room, move it, unplace it
- [ ] NOW tag on correct room
- [ ] Yesterday's task in Backlog with remainder
- [ ] Plan from backlog works
- [ ] Past dates read-only
- [ ] Works offline
- [ ] Habit instances created for today/later

### If You Get Stuck
- Look up how similar things were done in Steps 5-6
- Check SPEC.md for exact requirements
- Follow existing patterns exactly
- Ask if truly unclear (rule 17)
- Never guess or add extra features

### Current Test Status
**35/35 tests passing** - Don't break this. If adding tests, make sure they pass.

### Build Status
**Clean** - Must remain clean.

---

**Last Updated:** After regression audit following Step 6B  
**Current Step:** 7 (In Progress)  
**Firebase Project:** daymap-30f74  
**Test Account:** mrx.daymap.test@gmail.com  
**Status:** Ready for Step 7 completion
