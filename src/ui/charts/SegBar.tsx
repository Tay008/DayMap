interface SegBarProps {
  filled: number;
  total: number;
  label: string;
}

export default function SegBar({ filled, total, label }: SegBarProps) {
  const t = Math.max(0, total);
  const f = Math.max(0, Math.min(t, filled));
  return (
    <div className="dm-segs" role="img" aria-label={label}>
      {Array.from({ length: t }).map((_, i) => (
        <i key={i} className={i < f ? 'dm-on' : ''} />
      ))}
    </div>
  );
}
