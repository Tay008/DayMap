interface RingProps {
  percent: number;
  label: string;
}

export default function Ring({ percent, label }: RingProps) {
  const p = Math.max(0, Math.min(100, percent));
  const C = 2 * Math.PI * 48;
  return (
    <div className="dm-ring" role="img" aria-label={label}>
      <svg viewBox="0 0 120 120">
        <circle className="dm-ring-t" cx="60" cy="60" r="48" />
        <circle
          className="dm-ring-p"
          cx="60"
          cy="60"
          r="48"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p / 100)}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <b>{p}%</b>
    </div>
  );
}
