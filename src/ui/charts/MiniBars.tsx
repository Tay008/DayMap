interface MiniBarsProps {
  values: number[];
  labels: string[];
  label: string;
}

export default function MiniBars({ values, labels, label }: MiniBarsProps) {
  const max = Math.max(...values, 1);
  return (
    <div className="dm-mb" role="img" aria-label={label}>
      {values.map((v, i) => {
        const height = v === 0 ? 2 : Math.max(6, Math.round((v / max) * 64));
        const isToday = i === values.length - 1;
        return (
          <div key={i}>
            <b>{v > 0 ? v : ''}</b>
            <div className={isToday ? 'dm-mb-bar dm-today' : 'dm-mb-bar'} style={{ height }} />
            <small>{labels[i]}</small>
          </div>
        );
      })}
    </div>
  );
}
