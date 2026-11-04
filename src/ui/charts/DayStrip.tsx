interface DayStripProps {
  blocks: { id: string; name: string; startMin: number; endMin: number; tone: 'fx' | 'dawn' | 'day' | 'eve' | 'nt' }[];
  prayers: { key: string; label: string; min: number }[];
  nowMin: number | null;
}

export default function DayStrip({ blocks, prayers, nowMin }: DayStripProps) {
  return (
    <div className="dm-ds-wrap" role="img" aria-label="Your day, 24 hours">
      <div className="dm-ds">
        {blocks.map((block) => {
          const left = (block.startMin / 1440) * 100;
          const width = ((block.endMin - block.startMin) / 1440) * 100;
          return (
            <div
              key={block.id}
              className={`dm-ds-b dm-ds-${block.tone}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={block.name}
            >
              {width >= 12 ? <span>{block.name}</span> : null}
            </div>
          );
        })}
        {nowMin !== null ? (
          <>
            <div className="dm-ds-past" style={{ width: `${(nowMin / 1440) * 100}%` }} />
            <div className="dm-ds-now" style={{ left: `${(nowMin / 1440) * 100}%` }}>
              <b>Now</b>
            </div>
          </>
        ) : null}
        {prayers.map((p) => (
          <div key={p.key} className="dm-ds-p" style={{ left: `${(p.min / 1440) * 100}%` }}>
            <span>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
