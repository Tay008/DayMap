import { formatMinutes } from '../../lib/time';
import './PrayerMarker.css';

interface PrayerMarkerProps {
  name: string;
  minute: number;
}

export default function PrayerMarker({ name, minute }: PrayerMarkerProps) {
  return (
    <div className="prayer-marker">
      <span className="prayer-marker__line" />
      <span className="prayer-marker__label">
        {name} {formatMinutes(minute)}
      </span>
    </div>
  );
}
