import { useState } from 'react';
import * as api from '../services/api';
import type { DashboardStats, Game, IGDBGameResult, UserGame } from '../types';

export function useSearch() {
  const [results, setResults] = useState<IGDBGameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(query: string) {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchGames(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching games');
    } finally {
      setLoading(false);
    }
  }

  return { results, loading, error, search };
}

export function useLibrary() {
  const [games, setGames] = useState<UserGame[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchLibrary() {
    setLoading(true);
    try {
      const data = await api.getLibrary();
      setGames(data);
    } finally {
      setLoading(false);
    }
  }

  async function addToCollection(externalId: number) {
    const game = await api.addGame(externalId);
    await api.updateStatus(game.id, 'OWNED');
    await fetchLibrary();
  }

  async function changeStatus(gameId: string, status: string) {
    await api.updateStatus(gameId, status);
    await fetchLibrary();
  }

  return { games, loading, fetchLibrary, addToCollection, changeStatus };
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchStats() {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setStats(data);
    } finally {
      setLoading(false);
    }
  }

  return { stats, loading, fetchStats };
}
