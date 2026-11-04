# DayMap

An offline-first planner for one person. Each day is drawn as a map of rooms, and tasks
are placed into the rooms as plans. It includes habits with daily goals, a month calendar,
prayer times, a private streak counter, and a JSON backup, and it installs as a PWA.

- **Stack**: Vite, React 19, TypeScript (strict), React Router (HashRouter), Zustand,
  Firebase Auth + Firestore with persistent cache, `adhan`, `lucide-react`, Vitest.
- **Timezone**: always Asia/Karachi (`DateKey` strings, `YYYY-MM-DD`).
- **Design**: flat paper/ink with Paper, Ink and Moss themes.

## Requirements

- Node.js LTS and npm
- A Firebase project with **Email/Password** authentication and Firestore enabled

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root with the web app's Firebase values:

   ```bash
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_APP_ID=
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

Optional assets:

- `public/icon-192.png` and `public/icon-512.png` — PWA icons (simple flat icons are included;
  replace them with your own if you like). Regenerate them with `python3 scripts/make-icons.py`.
- `public/audio/azan.mp3` — optional azan sound. Without it the azan banner still works and
  Settings says the file is missing.

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # TypeScript check + production build
npm run preview  # preview the production build
npm test         # Vitest
npm run lint     # oxlint
```

The date logic is timezone-independent. Run the suite as `TZ=UTC npm test` and
`TZ=Asia/Karachi npm test` to confirm.

## Data and offline

- All Firebase access lives in `src/data/`; screens and components use hooks and data-layer
  functions only.
- After the first sign-in, the app runs from Firestore's persistent cache and the PWA service
  worker. Writes made offline sync when the connection returns.
- Firestore rules allow only the signed-in owner under `users/{uid}/**`.

## Deploy

One-time setup:

```bash
npm install -g firebase-tools
firebase login
firebase use daymap-30f74
```

Publish:

```bash
npm run build
firebase deploy --only hosting
```

The app is served from `dist`, every path rewrites to `index.html`, and `sw.js` is sent with
`Cache-Control: no-cache` so updates are picked up.

Rollback: open the Firebase console → Hosting → Release history, choose the previous
release and press **Rollback**. After a deploy, close every tab and reopen the app so the
service worker picks up the new bundle.

If you changed the security rules, deploy them separately:

```bash
firebase deploy --only firestore:rules
```

## Project layout

```text
docs/SPEC.md          the complete build specification
src/lib/              pure logic with Vitest tests (time, prayer, templates, progress, streak, backup)
src/data/             Firebase layer (auth, firestore, seed, counters, backup)
src/hooks/            React hooks over the data layer
src/ui/               design tokens, themes, icons and components
src/screens/          Login, Day, Calendar, Tasks, More, Settings, Habits, Domains, Holidays, Streak, Backup
```
# DayMap
