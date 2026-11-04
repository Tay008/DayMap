import type { ReactNode } from 'react';
import type { Domain, Task } from '../../data/types';
import type { ResolvedZone } from '../../lib/templates';
import PrayerMarker from './PrayerMarker';
import RoomCard from './RoomCard';
import RoomDoor from './RoomDoor';
import './DayMap.css';

interface Marker {
  name: string;
  minute: number;
}

interface DayMapProps {
  rooms: ResolvedZone[];
  tasksByRoom: Record<string, Task[]>;
  markers: Marker[];
  domainOf: (task: Task) => Domain | undefined;
  isToday: boolean;
  nowMin: number;
  isPast: boolean;
  onOpenTask: (task: Task) => void;
  onAddTask: (zoneId: string) => void;
}

export default function DayMap({
  rooms,
  tasksByRoom,
  markers,
  domainOf,
  isToday,
  nowMin,
  isPast,
  onOpenTask,
  onAddTask,
}: DayMapProps) {
  const nodes: ReactNode[] = [];
  let markerIndex = 0;

  rooms.forEach((room, index) => {
    if (index > 0) nodes.push(<RoomDoor key={`door-${room.id}`} />);
    while (markerIndex < markers.length && markers[markerIndex].minute <= room.startMin) {
      const marker = markers[markerIndex];
      nodes.push(
        <PrayerMarker key={`marker-${marker.name}`} name={marker.name} minute={marker.minute} />,
      );
      markerIndex += 1;
    }
    nodes.push(
      <RoomCard
        key={room.id}
        zone={room}
        tasks={(tasksByRoom[room.id] ?? []).filter((task) => task.kind !== 'daily_goal')}
        domainOf={domainOf}
        isNow={isToday && nowMin >= room.startMin && nowMin < room.endMin}
        isPast={isPast}
        onOpenTask={onOpenTask}
        onAddTask={() => onAddTask(room.id)}
      />,
    );
  });

  while (markerIndex < markers.length) {
    const marker = markers[markerIndex];
    nodes.push(
      <PrayerMarker key={`marker-${marker.name}`} name={marker.name} minute={marker.minute} />,
    );
    markerIndex += 1;
  }

  return <div className="day-map">{nodes}</div>;
}
