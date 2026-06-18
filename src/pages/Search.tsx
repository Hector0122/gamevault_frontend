import { useState } from 'react';
import { useSearch } from '../hooks/useGames';
import GameCard from '../components/GameCard';

export default function Search() {
  const [query, setQuery] = useState('');
  const { results, loading, error, search } = useSearch();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(query);
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Buscar Juegos</h2>
      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-6 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="mb-4 text-red-400">{error}</p>}

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((game) => (
            <GameCard
              key={game.id}
              game={{
                id: String(game.id),
                externalId: game.id,
                title: game.name,
                description: game.summary ?? '',
                coverUrl: game.cover?.url
                  ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
                  : '',
                releaseDate: game.first_release_date
                  ? new Date(game.first_release_date * 1000).toISOString()
                  : '',
                platforms: game.platforms?.map((p) => p.name) ?? [],
                genres: game.genres?.map((g) => g.name) ?? [],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
