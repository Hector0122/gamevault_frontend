import { useEffect } from 'react';
import { useLibrary } from '../hooks/useGames';
import StatusBadge from '../components/StatusBadge';
import type { GameStatus } from '../types';

const statuses: GameStatus[] = ['WISHLIST', 'OWNED', 'PLAYING', 'COMPLETED', 'DROPPED'];

export default function Library() {
  const { games, loading, fetchLibrary, changeStatus } = useLibrary();

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  if (loading && games.length === 0) {
    return <p className="text-gray-400">Cargando...</p>;
  }

  if (games.length === 0) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold">Biblioteca</h2>
        <p className="text-gray-400">Aún no tienes juegos. Busca y agrega desde la sección Buscar.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Biblioteca ({games.length})</h2>
      <div className="grid gap-4">
        {games.map((userGame) => (
          <div
            key={userGame.id}
            className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900 p-4"
          >
            <img
              src={userGame.game.coverUrl || '/placeholder.png'}
              alt={userGame.game.title}
              className="h-20 w-16 rounded object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{userGame.game.title}</h3>
              <StatusBadge status={userGame.status} />
            </div>
            <select
              value={userGame.status}
              onChange={(e) => changeStatus(userGame.gameId, e.target.value)}
              className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'WISHLIST' ? 'Deseado' : s === 'OWNED' ? 'Comprado' : s === 'PLAYING' ? 'Jugando' : s === 'COMPLETED' ? 'Completado' : 'Abandonado'}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
