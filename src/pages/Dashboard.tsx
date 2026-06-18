import { useEffect } from 'react';
import { useDashboard } from '../hooks/useGames';

const cards = [
  { key: 'total', label: 'Total' },
  { key: 'WISHLIST', label: 'Deseados' },
  { key: 'OWNED', label: 'Comprados' },
  { key: 'PLAYING', label: 'Jugando' },
  { key: 'COMPLETED', label: 'Completados' },
  { key: 'DROPPED', label: 'Abandonados' },
] as const;

export default function Dashboard() {
  const { stats, loading, fetchStats } = useDashboard();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return <p className="text-gray-400">Cargando...</p>;
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map(({ key, label }) => (
          <div key={key} className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{stats?.[key] ?? 0}</p>
            <p className="mt-1 text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
