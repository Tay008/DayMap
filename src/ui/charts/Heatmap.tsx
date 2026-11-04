import type { Level } from '../../lib/stats';

interface HeatmapProps {
  cells: { key: string; level: Level | null; title: string }[];
  label: string;
}

export default function Heatmap({ cells, label }: HeatmapProps) {
  return (
    <div className="dm-heat-wrap" role="img" aria-label={label}>
      <div className="dm-heat">
        {cells.map((cell) => (
          <i
            key={cell.key}
            title={cell.title}
            className={cell.level === null ? 'dm-fut' : `dm-l${cell.level}`}
          />
        ))}
      </div>
      <div className="dm-heat-leg">
        <span>Less</span>
        <i />
        <i className="dm-l1" />
        <i className="dm-l2" />
        <i className="dm-l3" />
        <span>More</span>
      </div>
    </div>
  );
}
