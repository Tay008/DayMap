import type { ResolvedZone } from '../../lib/templates';
import Button from './Button';
import Sheet from './Sheet';
import './RoomPicker.css';

interface RoomPickerProps {
  open: boolean;
  title: string;
  rooms: ResolvedZone[];
  onPick: (zoneId: string | null) => void;
  onClose: () => void;
}

export default function RoomPicker({ open, title, rooms, onPick, onClose }: RoomPickerProps) {
  const openRooms = rooms.filter((room) => room.kind === 'open');

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="room-picker">
        <Button variant="secondary" onClick={() => onPick(null)}>
          No room
        </Button>
        {openRooms.map((room) => (
          <Button key={room.id} variant="secondary" onClick={() => onPick(room.id)}>
            {room.name}
          </Button>
        ))}
      </div>
    </Sheet>
  );
}
