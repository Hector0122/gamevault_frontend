import type { Game } from '../types';

interface Props {
  game: Game;
  onAdd?: () => void;
}

export default function GameCard({ game, onAdd }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900 transition hover:border-gray-700">
      <img
        src={game.coverUrl || '/placeholder.png'}
        alt={game.title}
        className="h-64 w-full object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-white">{game.title}</h3>
        {game.genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {game.genres.map((g) => (
              <span key={g} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                {g}
              </span>
            ))}
          </div>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="mt-3 w-full rounded bg-emerald-600 py-1.5 text-sm font-medium hover:bg-emerald-500 transition-colors"
          >
            Agregar
          </button>
        )}
      </div>
    </div>
  );
}
