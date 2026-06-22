import { useState, useCallback, useRef } from 'react';
import { createMMKV } from 'react-native-mmkv';
import * as api from '../services/api';
import type { DashboardStats, DealRecommendation, Game, IGDBGameResult, UserGame, WishlistDeal } from '../types';

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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'recent' | 'title' | 'hours' | 'rating'>('recent');

  const nextPageRef = useRef(1);
  const PAGE_LIMIT = 50;

  const buildParams = useCallback(
    (p: number) => ({
      page: p,
      limit: PAGE_LIMIT,
      search: searchQuery || undefined,
      status: statusFilter ?? undefined,
      platform: platformFilter ?? undefined,
      genre: genreFilter ?? undefined,
      sort: sortKey,
    }),
    [searchQuery, statusFilter, platformFilter, genreFilter, sortKey],
  );

  const fetchLibrary = useCallback(async (reset = true) => {
    const p = reset ? 1 : nextPageRef.current;
    if (reset) {
      setLoading(true);
      setGames([]);
      nextPageRef.current = 1;
    } else {
      setLoadingMore(true);
    }
    try {
      const data = await api.getLibrary(buildParams(p));
      if (reset) {
        setGames(data.games);
        saveCachedLibrary(data.games);
      } else {
        setGames(prev => [...prev, ...data.games]);
      }
      setTotal(data.total);
      nextPageRef.current = p + 1;
      setIsOffline(false);
    } catch {
      if (reset) {
        const cached = loadCachedLibrary();
        if (cached) {
          setGames(cached);
          setTotal(cached.length);
        }
      }
      setIsOffline(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildParams]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || games.length >= total) return;
    fetchLibrary(false);
  }, [loadingMore, loading, games.length, total, fetchLibrary]);

  async function addToCollection(externalId: number, status = 'OWNED') {
    const game = await api.addGame(externalId);
    await api.updateStatus(game.id, status);
    await fetchLibrary(true);
  }

  async function changeStatus(gameId: string, status: string) {
    await api.updateStatus(gameId, status);
    await fetchLibrary(true);
  }

  async function updateStatus(gameId: string, status: string) {
    await api.updateStatus(gameId, status);
  }

  async function updateHours(gameId: string, hoursPlayed: number) {
    await api.updateHours(gameId, hoursPlayed);
    await fetchLibrary(true);
  }

  async function updateNotes(gameId: string, data: { rating?: number | null; notes?: string | null }, silent = false) {
    await api.updateNotes(gameId, data);
    if (silent) {
      setGames(prev => prev.map(g => (g.gameId === gameId ? { ...g, ...data } : g)));
    } else {
      await fetchLibrary(true);
    }
  }

  async function removeGame(gameId: string) {
    await api.removeGame(gameId);
    await fetchLibrary(true);
  }

  async function updatePriority(gameId: string, priority: string | null) {
    await api.updatePriority(gameId, priority);
    setGames(prev => prev.map(g => (g.gameId === gameId ? { ...g, priority: priority as any } : g)));
  }

  return {
    games, total, loading, loadingMore, isOffline,
    fetchLibrary, loadMore,
    addToCollection, changeStatus, updateStatus, updateHours, updateNotes, removeGame, updatePriority,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    platformFilter, setPlatformFilter,
    genreFilter, setGenreFilter,
    sortKey, setSortKey,
  };
}

export function useDeals() {
  const [recommendations, setRecommendations] = useState<DealRecommendation[]>([]);
  const [wishlistDeals, setWishlistDeals] = useState<WishlistDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recData] = await Promise.all([
        api.getDeals(),
      ]);
      setRecommendations(recData.recommendations);
      setMessage(recData.message ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener ofertas');
    }
    try {
      const wlData = await api.getWishlistDeals();
      setWishlistDeals(wlData.deals);
    } catch {
      // wishlist deals is optional — ignore errors
    } finally {
      setLoading(false);
    }
  }, []);

  return { recommendations, wishlistDeals, loading, error, message, fetchDeals };
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
