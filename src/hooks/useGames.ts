import { useState, useCallback } from 'react';
import { createMMKV } from 'react-native-mmkv';
import * as api from '../services/api';
import type { DashboardStats, Game, IGDBGameResult, UserGame } from '../types';

const cache = createMMKV({ id: 'gamevault_cache' });

const CACHE_LIBRARY = 'cache_library';
const CACHE_DASHBOARD = 'cache_dashboard';

function loadCachedLibrary(): UserGame[] | null {
  const raw = cache.getString(CACHE_LIBRARY);
  return raw ? JSON.parse(raw) : null;
}

function saveCachedLibrary(games: UserGame[]) {
  cache.set(CACHE_LIBRARY, JSON.stringify(games));
}

function loadCachedDashboard(): DashboardStats | null {
  const raw = cache.getString(CACHE_DASHBOARD);
  return raw ? JSON.parse(raw) : null;
}

function saveCachedDashboard(stats: DashboardStats) {
  cache.set(CACHE_DASHBOARD, JSON.stringify(stats));
}

const LIMIT = 20;

export function useSearch() {
  const [results, setResults] = useState<IGDBGameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [ownedIds, setOwnedIds] = useState<number[]>([]);

  async function fetchOwnedIds() {
    try {
      const res = await api.getUserGameIds();
      setOwnedIds(res.ids);
    } catch {}
  }

  async function search(query: string) {
    if (!query.trim()) return;
    setCurrentQuery(query);
    setResults([]);
    setLoading(true);
    setError(null);
    try {
      const [data] = await Promise.all([
        api.searchGames(query, 0),
        ownedIds.length === 0 ? fetchOwnedIds() : Promise.resolve(),
      ]);
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
    } finally {
      setLoadingMore(false);
    }
  }

  return { results, loading, loadingMore, error, search, loadMore, ownedIds, fetchOwnedIds };
}

export function useLibrary() {
  const [games, setGames] = useState<UserGame[]>(() => loadCachedLibrary() ?? []);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getLibrary();
      setGames(data);
      saveCachedLibrary(data);
      setIsOffline(false);
    } catch {
      const cached = loadCachedLibrary();
      if (cached) setGames(cached);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return { games, loading, isOffline, fetchLibrary, addToCollection, changeStatus, updateHours, updateNotes, removeGame };
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(() => loadCachedDashboard());
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setStats(data);
      saveCachedDashboard(data);
      setIsOffline(false);
    } catch {
      const cached = loadCachedDashboard();
      if (cached) setStats(cached);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, isOffline, fetchStats };
}
