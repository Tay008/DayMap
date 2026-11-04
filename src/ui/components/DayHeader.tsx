import { formatDateLong, type DateKey } from '../../lib/time';
import { iconFor, iconProps } from '../icons';
import Button from './Button';
import './DayHeader.css';

const PrevIcon = iconFor('chevron-left');
const NextIcon = iconFor('chevron-right');

interface DayHeaderProps {
  dateKey: DateKey;
  isToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function DayHeader({
  dateKey,
  isToday,
  onPrev,
  onNext,
  onToday,
}: DayHeaderProps) {
  return (
    <div className="day-header">
      <div className="day-header__main">
        <h2 className="day-header__date" dir="auto">
          {formatDateLong(dateKey)}
        </h2>
        {isToday ? <span className="day-header__today">Today</span> : null}
      </div>
      <div className="day-header__nav">
        <Button
          variant="secondary"
          className="day-header__btn"
          aria-label="Previous day"
          onClick={onPrev}
        >
          <PrevIcon {...iconProps} />
        </Button>
        <Button
          variant="secondary"
          className="day-header__btn"
          aria-label="Next day"
          onClick={onNext}
        >
          <NextIcon {...iconProps} />
        </Button>
        {!isToday ? (
          <Button variant="secondary" onClick={onToday}>
            Go to today
          </Button>
        ) : null}
      </div>
    </div>
  );
}
