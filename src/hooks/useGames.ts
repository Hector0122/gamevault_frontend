import { useState } from 'react';
import * as api from '../services/api';
import type { DashboardStats, Game, IGDBGameResult, UserGame } from '../types';

const LIMIT = 20;

export function useSearch() {
  const [results, setResults] = useState<IGDBGameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');

  async function search(query: string) {
    if (!query.trim()) return;
    setCurrentQuery(query);
    setResults([]);
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchGames(query, 0);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching games');
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (loadingMore || loading || !currentQuery) return;
    setLoadingMore(true);
    try {
      const data = await api.searchGames(currentQuery, results.length);
      setResults(prev => [...prev, ...data]);
    } catch {
      // ignore errors when loading more
    } finally {
      setLoadingMore(false);
    }
  }

  return { results, loading, loadingMore, error, search, loadMore };
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

  async function addToCollection(externalId: number, status = 'OWNED') {
    const game = await api.addGame(externalId);
    await api.updateStatus(game.id, status);
    await fetchLibrary();
  }

  async function changeStatus(gameId: string, status: string) {
    await api.updateStatus(gameId, status);
    await fetchLibrary();
  }

  async function updateHours(gameId: string, hoursPlayed: number) {
    await api.updateHours(gameId, hoursPlayed);
    await fetchLibrary();
  }

  async function updateNotes(gameId: string, data: { rating?: number | null; notes?: string | null }) {
    await api.updateNotes(gameId, data);
    await fetchLibrary();
  }

  async function removeGame(gameId: string) {
    await api.removeGame(gameId);
    await fetchLibrary();
  }

  return { games, loading, fetchLibrary, addToCollection, changeStatus, updateHours, updateNotes, removeGame };
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
