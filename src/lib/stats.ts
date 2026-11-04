import { addDays, dateKeyFromMs } from './time';
import type { DateKey } from './time';
import type { Domain, Task } from '../data/types';

export type Level = 0 | 1 | 2 | 3;

export function dayLevel(done: number, planned: number): Level {
  if (planned === 0) return 0;
  if (done >= planned) return 3;
  const ratio = done / planned;
  if (ratio >= 0.5) return 2;
  return 1;
}

export function percent(done: number, planned: number): number {
  if (planned === 0) return 0;
  const p = Math.round((done / planned) * 100);
  if (p < 0) return 0;
  if (p > 100) return 100;
  return p;
}

export function lastDateKeys(endKey: DateKey, n: number): DateKey[] {
  if (n <= 0) return [];
  const out: DateKey[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    out.push(addDays(endKey, -i));
  }
  return out;
}

export function doneCountsByDay(doneAtMs: number[], keys: DateKey[]): number[] {
  const counts = new Map<DateKey, number>();
  for (const key of keys) {
    counts.set(key, 0);
  }
  for (const ms of doneAtMs) {
    if (typeof ms !== 'number' || Number.isNaN(ms)) continue;
    const key = dateKeyFromMs(ms);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return keys.map((key) => counts.get(key) ?? 0);
}

export interface Slice {
  id: string;
  label: string;
  value: number;
}

export function domainSlices(openTasks: Task[], domains: Domain[]): Slice[] {
  const counts = new Map<string, number>();
  for (const domain of domains) {
    counts.set(domain.id, 0);
  }
  for (const task of openTasks) {
    if (task.domainId && counts.has(task.domainId)) {
      counts.set(task.domainId, (counts.get(task.domainId) ?? 0) + 1);
    } else if (task.domainId) {
      counts.set(task.domainId, (counts.get(task.domainId) ?? 0) + 1);
    }
  }
  const slices: Slice[] = [];
  for (const domain of domains) {
    const value = counts.get(domain.id) ?? 0;
    if (value === 0) continue;
    slices.push({ id: domain.id, label: domain.name, value });
  }
  slices.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return a.label.localeCompare(b.label);
  });
  return slices;
}

export function monthStats(days: { done: number; planned: number }[]): {
  done: number;
  planned: number;
  perfectDays: number;
} {
  let done = 0;
  let planned = 0;
  let perfectDays = 0;
  for (const day of days) {
    done += day.done;
    planned += day.planned;
    if (day.planned > 0 && day.done >= day.planned) {
      perfectDays += 1;
    }
  }
  return { done, planned, perfectDays };
}

export function heatGridKeys(
  todayKey: DateKey,
  weeks: number,
): { key: DateKey; future: boolean }[] {
  const result: { key: DateKey; future: boolean }[] = [];
  const total = Math.max(0, weeks) * 7;
  if (total === 0) return result;
  // Find Monday of the week containing today
  const [y, m, d] = todayKey.split('-').map(Number);
  const todayDate = new Date(Date.UTC(y, m - 1, d));
  const day = todayDate.getUTCDay(); // 0 Sun, 1 Mon, ...
  const diffToMonday = (day + 6) % 7; // days since Monday
  const monday = new Date(todayDate);
  monday.setUTCDate(todayDate.getUTCDate() - diffToMonday);
  const mondayKey = monday.toISOString().slice(0, 10);
  for (let i = total - 7; i >= 0; i -= 7) {
    // build week starting at mondayKey shifted back by i days? we want last column to be current week
  }
  // easier: generate from (weeks-1) weeks ago monday to current monday + 6
  const startMonday = addDays(mondayKey, -(weeks - 1) * 7);
  for (let i = 0; i < total; i += 1) {
    const key = addDays(startMonday, i);
    const future = key > todayKey;
    result.push({ key, future });
  }
  return result;
}
