import type { PrayerDay, PrayerName } from '../../lib/prayer';
import { PRAYER_ORDER } from '../../lib/prayer';
import { formatClock, formatCountdown } from '../../lib/time';
import './PrayerStrip.css';

interface PrayerStripProps {
  prayers: PrayerDay;
  next: { name: PrayerName; time: number } | null;
  now: number;
}

export default function PrayerStrip({ prayers, next, now }: PrayerStripProps) {
  return (
    <div className="prayers">
      {PRAYER_ORDER.map((name) => {
        const active = next !== null && next.name === name;
        return (
          <div
            key={name}
            className={active ? 'prayers__item prayers__item--next' : 'prayers__item'}
          >
            <span className="prayers__name">{name}</span>
            <span className="prayers__time">{formatClock(prayers[name])}</span>
            {active && next ? (
              <span className="prayers__count">{formatCountdown(next.time - now)}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
