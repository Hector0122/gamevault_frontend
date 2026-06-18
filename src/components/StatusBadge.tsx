import type { GameStatus } from '../types';

const colors: Record<GameStatus, string> = {
  WISHLIST: 'bg-purple-900 text-purple-300',
  OWNED: 'bg-blue-900 text-blue-300',
  PLAYING: 'bg-green-900 text-green-300',
  COMPLETED: 'bg-emerald-900 text-emerald-300',
  DROPPED: 'bg-red-900 text-red-300',
};

const labels: Record<GameStatus, string> = {
  WISHLIST: 'Deseado',
  OWNED: 'Comprado',
  PLAYING: 'Jugando',
  COMPLETED: 'Completado',
  DROPPED: 'Abandonado',
};

interface Props {
  status: GameStatus;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}
