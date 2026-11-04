import type { PrayerName } from '../lib/prayer';

export type DateKey = string; // 'YYYY-MM-DD', Pakistan time
export type Priority = 1 | 2 | 3; // 1 = high
export type TemplateKey = 'normal-college' | 'normal-off' | 'ramadan-college' | 'ramadan-off';

export interface Domain {
  id: string;
  name: string;
  colorIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  icon: string;
  order: number;
}

export interface Task {
  id: string;
  title: string; // 1 to 120 characters
  domainId: string;
  priority: Priority;
  kind: 'one_off' | 'daily_goal';
  target: number; // greater than 0
  unit: string; // 'check' | '%' | 'items' | 'pages' | 'min' | 'ml' | any short text
  plannedDate: DateKey | null; // null = unplanned, shows in Backlog
  zoneId: string | null; // room id from that day's template, or null
  notes: string;
  habitId: string | null; // set on daily_goal instances
  progress?: number; // changed ONLY by increment(); read as progress ?? 0
  doneAt: number | null; // ms when progress first reached target, else null (always written)
  createdAt: number;
  updatedAt: number;
}

export interface Log {
  id: string;
  taskId: string;
  amount: number;
  dateKey: DateKey;
  at: number;
}

export interface Habit {
  id: string;
  title: string;
  domainId: string;
  priority: Priority;
  target: number;
  unit: string;
  daysOfWeek: number[]; // 0 = Sunday ... 6 = Saturday
  quickAdds: number[]; // e.g. [250, 500]
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  collegeStart: number; // minutes since midnight, default 480 (8:00 AM)
  collegeEnd: number; // default 840 (2:00 PM)
  collegeDays: number[]; // default [1,2,3,4,5]
  ramadanStart: DateKey | null; // typed in by the human after moon sighting
  ramadanDays: 29 | 30; // default 30
  taraweehMinutes: number; // default 90
  lat: number;
  lng: number; // default 31.5204, 74.3587 (Lahore)
  adjust: Record<PrayerName, number>; // minutes to add, default all 0
  azanSound: boolean; // default false
  theme: 'paper' | 'ink' | 'moss';
  urgePlan: string[];
}

export interface Holiday {
  id: string;
  dateKey: DateKey;
  name: string;
}

export interface DayOverride {
  dateKey: DateKey;
  templateKey: TemplateKey;
}

export interface Counter {
  id: string;
  label: string;
  startDateKey: DateKey;
  localOnly: boolean;
  createdAt: number;
}

export interface CounterEvent {
  id: string;
  counterId: string;
  type: 'relapse' | 'urge';
  dateKey: DateKey;
  at: number;
  note: string;
}
