import { formatCountdown, formatDateLong, formatMinutes, minutesOfDay } from './time';
import { nextPrayer, PRAYER_ORDER } from './prayer';
import type { PrayerName } from './prayer';
import type { DateKey } from './time';
import type { ResolvedZone } from './templates';
import { hijriInfo } from './calendarMarks';

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerCellView = {
  key: PrayerKey;
  label: string;
  urdu: string;
  timeLabel: string;
  isNext: boolean;
  untilLabel: string | null;
};

export type RoomColor = 'dawn' | 'day' | 'eve' | 'nt';

export type BlockView =
  | { kind: 'fixed'; id: string; name: string; startLabel: string; endLabel: string; isNow: boolean; startMin: number; endMin: number }
  | {
      kind: 'room';
      id: string;
      name: string;
      startLabel: string;
      endLabel: string;
      isNow: boolean;
      isPast: boolean;
      hasTasks: boolean;
      color: RoomColor;
      startMin: number;
      endMin: number;
    };

export type HeroView = { name: string; rangeLabel: string; remainingLabel: string; percent: number };

export type TodayView = {
  weekday: string;
  dateLabel: string;
  hijriLabel: string;
  prayers: PrayerCellView[];
  prayerMarks: { key: PrayerKey; label: string; min: number }[];
  hero: HeroView | null;
  blocks: BlockView[];
  nowMin: number | null;
};

export interface TodayInput {
  now: number;
  dateKey: DateKey;
  isToday: boolean;
  prayerMin: Record<PrayerName, number>;
  prayerMs: Record<PrayerName, number>;
  tomorrowPrayerMs?: Record<PrayerName, number>;
  blocks: ResolvedZone[];
  taskCountByRoom: Record<string, number>;
}

const FIXED_BLOCKS = new Set(['Sleep', 'Prep & Commute', 'College']);

const URDU: Record<PrayerKey, string> = {
  fajr: 'فجر',
  dhuhr: 'ظہر',
  asr: 'عصر',
  maghrib: 'مغرب',
  isha: 'عشاء',
};

function roomColorByStart(min: number, prayerMin: Record<PrayerName, number>): RoomColor {
  if (min < 12 * 60) return 'dawn';
  const maghrib = prayerMin.maghrib;
  if (min < maghrib) return 'day';
  const isha = prayerMin.isha;
  if (min < isha) return 'eve';
  return 'nt';
}

function formatCountdownFromMs(ms: number): string {
  return formatCountdown(ms);
}

export function buildTodayView(input: TodayInput): TodayView {
  const { now, dateKey, isToday, prayerMin, prayerMs, tomorrowPrayerMs, blocks, taskCountByRoom } =
    input;

  const longDate = formatDateLong(dateKey);
  const weekday = longDate.split(',')[0] ?? dateKey;
  const dateLabel = longDate.split(',').slice(1).join(',').trim();
  const hijri = hijriInfo(dateKey, 0);
  const hijriLabel = `${hijri.day} ${hijri.monthName} ${hijri.year}`;

  const nowMin = minutesOfDay(now);

  let nextPrayerInfo: { name: PrayerName; time: number } | null = null;
  if (isToday) {
    const tomorrowDay = tomorrowPrayerMs
      ? {
          fajr: tomorrowPrayerMs.fajr,
          sunrise: tomorrowPrayerMs.sunrise,
          dhuhr: tomorrowPrayerMs.dhuhr,
          asr: tomorrowPrayerMs.asr,
          maghrib: tomorrowPrayerMs.maghrib,
          isha: tomorrowPrayerMs.isha,
        }
      : undefined;
    const dayPrayers = {
      fajr: prayerMs.fajr,
      sunrise: prayerMs.sunrise,
      dhuhr: prayerMs.dhuhr,
      asr: prayerMs.asr,
      maghrib: prayerMs.maghrib,
      isha: prayerMs.isha,
    };
    nextPrayerInfo = nextPrayer(now, dayPrayers, tomorrowDay);
  }

  const prayers: PrayerCellView[] = PRAYER_ORDER.map((name) => {
    const key = name as PrayerKey;
    const isNext = isToday && nextPrayerInfo !== null && nextPrayerInfo.name === name;
    let untilLabel: string | null = null;
    if (isNext && nextPrayerInfo) {
      const diff = nextPrayerInfo.time - now;
      untilLabel = formatCountdownFromMs(diff > 0 ? diff : 0);
    }
    return {
      key,
      label: name,
      urdu: URDU[key],
      timeLabel: formatMinutes(prayerMin[name]),
      isNext,
      untilLabel,
    };
  });

  const prayerMarks = PRAYER_ORDER.map((name) => ({
    key: name as PrayerKey,
    label: name,
    min: prayerMin[name],
  }));

  let hero: HeroView | null = null;
  const blockViews: BlockView[] = blocks.map((block: ResolvedZone) => {
    const isNow = isToday && nowMin >= block.startMin && nowMin < block.endMin;
    const startLabel = formatMinutes(block.startMin);
    const endLabel = block.endMin >= 1440 ? formatMinutes(1440) : formatMinutes(block.endMin);
    if (FIXED_BLOCKS.has(block.name) || block.kind !== 'open') {
      return {
        kind: 'fixed',
        id: block.id,
        name: block.name,
        startLabel,
        endLabel,
        isNow,
        startMin: block.startMin,
        endMin: block.endMin >= 1440 ? 1440 : block.endMin,
      };
    }
    const isPast = isToday && block.endMin <= nowMin;
    const hasTasks = (taskCountByRoom[block.id] ?? 0) > 0;
    const color = roomColorByStart(block.startMin, prayerMin);
    return {
      kind: 'room',
      id: block.id,
      name: block.name,
      startLabel,
      endLabel,
      isNow,
      isPast,
      hasTasks,
      color,
      startMin: block.startMin,
      endMin: block.endMin >= 1440 ? 1440 : block.endMin,
    };
  });

  if (isToday) {
    const current = blocks.find((b) => nowMin >= b.startMin && nowMin < b.endMin);
    if (current) {
      const remainingMinMs = Math.max(0, (current.endMin - nowMin) * 60000);
      const remainingLabel = formatCountdownFromMs(remainingMinMs);
      const totalMin = Math.max(1, current.endMin - current.startMin);
      const percent = Math.round(Math.max(0, Math.min(100, ((nowMin - current.startMin) / totalMin) * 100)));
      hero = {
        name: current.name,
        rangeLabel: `${formatMinutes(current.startMin)} to ${formatMinutes(current.endMin)}`,
        remainingLabel,
        percent,
      };
    }
  }

  return {
    weekday,
    dateLabel,
    hijriLabel,
    prayers,
    prayerMarks,
    hero,
    blocks: blockViews,
    nowMin: isToday ? nowMin : null,
  };
}
