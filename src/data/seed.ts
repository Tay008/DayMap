import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { reportError } from './repo';
import holidays from './seed/holidays-pk.json';
import type { Domain, Habit, Settings } from './types';

const SEED_DOMAINS: Domain[] = [
  { id: 'study', name: 'Study', colorIndex: 1, icon: 'book', order: 1 },
  { id: 'webdev', name: 'Web Dev', colorIndex: 2, icon: 'code', order: 2 },
  { id: 'cyber', name: 'Cybersecurity', colorIndex: 3, icon: 'shield', order: 3 },
  { id: 'quran', name: 'Quran', colorIndex: 4, icon: 'moon', order: 4 },
  { id: 'health', name: 'Health', colorIndex: 5, icon: 'heart', order: 5 },
  { id: 'chores', name: 'Chores', colorIndex: 6, icon: 'home', order: 6 },
];

const DEFAULT_SETTINGS: Settings = {
  collegeStart: 480,
  collegeEnd: 840,
  collegeDays: [1, 2, 3, 4, 5],
  ramadanStart: null,
  ramadanDays: 30,
  taraweehMinutes: 90,
  lat: 31.5204,
  lng: 74.3587,
  adjust: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  azanSound: false,
  theme: 'paper',
  urgePlan: [
    'Stand up and leave the room.',
    'Make wudu.',
    'Do 20 push-ups.',
    'Go outside or call someone.',
    'Open your next task and do five minutes.',
  ],
};

// On sign-in: if settings/main does not exist, write the six domains, the default
// settings, one Water habit and the seeded holidays in a single batch. Never overwrite.
export function seedIfEmpty(uid: string): void {
  const mainRef = doc(db, `users/${uid}/settings/main`);
  getDoc(mainRef)
    .then((snapshot) => {
      if (snapshot.exists()) return;
      const now = Date.now();
      const water: Habit = {
        id: crypto.randomUUID(),
        title: 'Water',
        domainId: 'health',
        priority: 2,
        target: 3000,
        unit: 'ml',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        quickAdds: [250, 500],
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      const batch = writeBatch(db);
      batch.set(mainRef, DEFAULT_SETTINGS);
      for (const domain of SEED_DOMAINS) {
        batch.set(doc(db, `users/${uid}/domains/${domain.id}`), domain);
      }
      batch.set(doc(db, `users/${uid}/habits/${water.id}`), water);
      for (const holiday of holidays) {
        const id = crypto.randomUUID();
        batch.set(doc(db, `users/${uid}/holidays/${id}`), {
          id,
          dateKey: holiday.dateKey,
          name: holiday.name,
        });
      }
      batch.commit().catch(reportError);
    })
    .catch(reportError);
}
