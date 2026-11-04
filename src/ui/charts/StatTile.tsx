interface StatTileProps {
  value: string | number;
  caption: string;
}

export default function StatTile({ value, caption }: StatTileProps) {
  return (
    <div className="dm-stat">
      <b>{value}</b>
      <span>{caption}</span>
    </div>
  );
}
