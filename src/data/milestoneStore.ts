const STORAGE_KEY = 'daymap.milestones.v1';

type MilestoneMap = Record<string, unknown>;

function readAll(): MilestoneMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as MilestoneMap;
  } catch {
    return {};
  }
}

export function readMilestones(counterId: string): number[] {
  const entry = readAll()[counterId];
  return Array.isArray(entry)
    ? entry.filter((value): value is number => typeof value === 'number')
    : [];
}

export function addMilestone(counterId: string, milestone: number): void {
  const all = readAll();
  const current = readMilestones(counterId);
  if (current.includes(milestone)) return;
  all[counterId] = [...current, milestone];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage can be blocked (private mode); the notice just shows again next time
  }
}
