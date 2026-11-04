import type { HolidayKind } from '../../lib/calendarMarks';

interface KindGlyphProps {
  kind: HolidayKind;
}

export default function KindGlyph({ kind }: KindGlyphProps) {
  if (kind === 'public') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
      </svg>
    );
  }
  if (kind === 'religious') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (kind === 'optional') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l9 9-9 9-9-9z" />
    </svg>
  );
}
