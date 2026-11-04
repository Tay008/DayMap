interface StackBarProps {
  slices: { id: string; label: string; value: number; color: string }[];
  onPick?: (id: string) => void;
}

export default function StackBar({ slices, onPick }: StackBarProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const sentence =
    total === 0
      ? 'No tasks'
      : slices.map((s) => `${s.label} ${s.value}`).join(', ');
  return (
    <>
      <div className="dm-stk" role="img" aria-label={sentence}>
        {slices.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => onPick?.(s.id)}
            style={{ flex: `${s.value} 1 0`, background: s.color }}
            title={s.label}
          >
            {s.value}
          </button>
        ))}
      </div>
      <div className="dm-legend">
        {slices.map((s) => (
          <span key={s.id}>
            <i style={{ background: s.color }} />
            {s.label} {s.value}
          </span>
        ))}
      </div>
    </>
  );
}
