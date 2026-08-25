import { useState, useCallback, useRef, useEffect } from 'react';
import { createMMKV } from 'react-native-mmkv';
import * as api from '../services/api';
import { NetworkError } from '../services/api';
import {
  enqueueMutation,
  flushMutationQueue,
  getPendingMutationCount,
} from '../services/mutationQueue';
import type {
  DashboardStats,
  DealRecommendation,
  GameStatus,
  IGDBGameResult,
  UserGame,
  WishlistDeal,
} from '../types';

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

export function useSearch() {
  const [results, setResults] = useState<IGDBGameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [ownedIds, setOwnedIds] = useState<number[]>([]);
  // Identifica la búsqueda más reciente para poder descartar respuestas que
  // lleguen fuera de orden (ej. el usuario busca "mario", luego "zelda"
  // antes de que la primera responda) — sin esto la respuesta que llegue
  // último "gana" sin importar a qué query corresponde.
  const searchTokenRef = useRef(0);

  async function fetchOwnedIds() {
    try {
      const res = await api.getUserGameIds();
      setOwnedIds(res.ids);
    } catch {}
  }

  async function search(query: string) {
    if (!query.trim()) return;
    const token = ++searchTokenRef.current;
    setCurrentQuery(query);
    setResults([]);
    setLoading(true);
    setError(null);
    try {
      const [data] = await Promise.all([
        api.searchGames(query, 0),
        ownedIds.length === 0 ? fetchOwnedIds() : Promise.resolve(),
      ]);
      if (token !== searchTokenRef.current) return;
      setResults(data);
    } catch (err) {
      if (token !== searchTokenRef.current) return;
      setError(err instanceof Error ? err.message : 'Error searching games');
    } finally {
      if (token === searchTokenRef.current) setLoading(false);
    }
  }

  async function loadMore() {
    if (loadingMore || loading || !currentQuery) return;
    const token = searchTokenRef.current;
    setLoadingMore(true);
    try {
      const data = await api.searchGames(currentQuery, results.length);
      if (token !== searchTokenRef.current) return;
      setResults(prev => [...prev, ...data]);
    } catch {
    } finally {
      if (token === searchTokenRef.current) setLoadingMore(false);
    }
  }

  return {
    results,
    loading,
    loadingMore,
    error,
    search,
    loadMore,
    ownedIds,
    fetchOwnedIds,
  };
}

export function useLibrary() {
  const [games, setGames] = useState<UserGame[]>(
    () => loadCachedLibrary() ?? [],
  );
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const initialCache = loadCachedLibrary();
  const [libraryTotalCount, setLibraryTotalCount] = useState(() =>
    initialCache ? initialCache.length : 0,
  );
  const [libraryTotalCountInitialized, setLibraryTotalCountInitialized] =
    useState(() => !!initialCache);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<
    'recent' | 'title' | 'hours' | 'rating'
  >('recent');
  const [pendingMutationCount, setPendingMutationCount] = useState(() =>
    getPendingMutationCount(),
  );
  // Opciones de filtro de plataforma/género: vienen de un endpoint aparte
  // que cubre TODA la biblioteca del usuario, no solo `games` (que es la
  // página cargada) — si no, con más de PAGE_LIMIT juegos o con filtros ya
  // aplicados faltaban opciones o se iban encogiendo.
  const [platformOptions, setPlatformOptions] = useState<string[]>([]);
  const [genreOptions, setGenreOptions] = useState<string[]>([]);

  const fetchFacets = useCallback(async () => {
    try {
      const data = await api.getFacets();
      setPlatformOptions(data.platforms);
      setGenreOptions(data.genres);
    } catch {}
  }, []);

  const nextPageRef = useRef(1);
  const fetchingRef = useRef(false);
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

  const fetchLibrary = useCallback(
    async (reset = true) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      const p = reset ? 1 : nextPageRef.current;
      if (reset) {
        setLoading(true);
        setGames([]);
        nextPageRef.current = 1;
        fetchFacets();
        // Si recuperamos señal, manda primero los cambios pendientes para
        // que la biblioteca que se recarga ya los refleje.
        const { remaining } = await flushMutationQueue().catch(() => ({
          remaining: getPendingMutationCount(),
        }));
        setPendingMutationCount(remaining);
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
        if (!searchQuery && !statusFilter && !platformFilter && !genreFilter) {
          setLibraryTotalCount(data.total);
          setLibraryTotalCountInitialized(true);
        }
      } catch {
        if (reset) {
          const cached = loadCachedLibrary();
          if (cached) {
            setGames(cached);
            setTotal(cached.length);
            setLibraryTotalCount(cached.length);
            setLibraryTotalCountInitialized(true);
          }
        }
        setIsOffline(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }
    },
    [buildParams, searchQuery, statusFilter, platformFilter, genreFilter, fetchFacets],
  );

  const loadMore = useCallback(() => {
    if (loadingMore || loading || games.length >= total) return;
    fetchLibrary(false);
  }, [loadingMore, loading, games.length, total, fetchLibrary]);

  async function addToCollection(externalId: number, status = 'OWNED') {
    // Requiere haber buscado el juego en IGDB primero, lo que ya requiere
    // conexión — no tiene sentido encolar esto para offline.
    const game = await api.addGame(externalId);
    await api.updateStatus(game.id, status);
  }

  function markPendingSync() {
    setPendingMutationCount(getPendingMutationCount());
  }

  async function changeStatus(gameId: string, status: string) {
    try {
      await api.updateStatus(gameId, status);
      await fetchLibrary(true);
    } catch (err) {
      if (err instanceof NetworkError) {
        enqueueMutation({ type: 'status', gameId, status });
        setGames(prev =>
          prev.map(g =>
            g.gameId === gameId ? { ...g, status: status as GameStatus } : g,
          ),
        );
        markPendingSync();
        return;
      }
      throw err;
    }
  }

  async function updateStatus(gameId: string, status: string) {
    try {
      await api.updateStatus(gameId, status);
    } catch (err) {
      if (err instanceof NetworkError) {
        enqueueMutation({ type: 'status', gameId, status });
        setGames(prev =>
          prev.map(g =>
            g.gameId === gameId ? { ...g, status: status as GameStatus } : g,
          ),
        );
        markPendingSync();
        return;
      }
      throw err;
    }
  }

  async function updateHours(gameId: string, hoursPlayed: number) {
    try {
      await api.updateHours(gameId, hoursPlayed);
      await fetchLibrary(true);
    } catch (err) {
      if (err instanceof NetworkError) {
        enqueueMutation({ type: 'hours', gameId, hoursPlayed });
        setGames(prev =>
          prev.map(g => (g.gameId === gameId ? { ...g, hoursPlayed } : g)),
        );
        markPendingSync();
        return;
      }
      throw err;
    }
  }

  async function updateNotes(
    gameId: string,
    data: { rating?: number | null; notes?: string | null },
    silent = false,
  ) {
    try {
      await api.updateNotes(gameId, data);
      if (silent) {
        setGames(prev =>
          prev.map(g => (g.gameId === gameId ? { ...g, ...data } : g)),
        );
      } else {
        await fetchLibrary(true);
      }
    } catch (err) {
      if (err instanceof NetworkError) {
        enqueueMutation({ type: 'notes', gameId, data });
        setGames(prev =>
          prev.map(g => (g.gameId === gameId ? { ...g, ...data } : g)),
        );
        markPendingSync();
        return;
      }
      throw err;
    }
  }

  async function removeGame(gameId: string) {
    // Borrar es destructivo: si lo encoláramos y lo quitáramos de la lista
    // localmente, el usuario podría creer que ya se borró y olvidarse de que
    // nunca se sincronizó. Mejor fallar de forma visible aquí.
    await api.removeGame(gameId);
    await fetchLibrary(true);
  }

  async function updatePriority(gameId: string, priority: string | null) {
    try {
      await api.updatePriority(gameId, priority);
      setGames(prev =>
        prev.map(g =>
          g.gameId === gameId ? { ...g, priority: priority as any } : g,
        ),
      );
    } catch (err) {
      if (err instanceof NetworkError) {
        enqueueMutation({ type: 'priority', gameId, priority });
        setGames(prev =>
          prev.map(g =>
            g.gameId === gameId ? { ...g, priority: priority as any } : g,
          ),
        );
        markPendingSync();
        return;
      }
      throw err;
    }
  }

  return {
    games,
    total,
    loading,
    loadingMore,
    isOffline,
    fetchLibrary,
    loadMore,
    addToCollection,
    changeStatus,
    updateStatus,
    updateHours,
    updateNotes,
    removeGame,
    updatePriority,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    platformFilter,
    setPlatformFilter,
    genreFilter,
    setGenreFilter,
    sortKey,
    setSortKey,
    libraryTotalCount,
    libraryTotalCountInitialized,
    pendingMutationCount,
    platformOptions,
    genreOptions,
    fetchFacets,
  };
}

const DEALS_POLL_INTERVAL_MS = 3000;
const DEALS_POLL_MAX_ATTEMPTS = 20; // ~1 minuto

export function useDeals() {
  const [recommendations, setRecommendations] = useState<DealRecommendation[]>(
    [],
  );
  const [wishlistDeals, setWishlistDeals] = useState<WishlistDeal[]>([]);
  const [loading, setLoading] = useState(false);
  // El servidor genera las recomendaciones en segundo plano (llama a la IA,
  // busca portadas y precios); mientras tanto responde "pending" y hay que
  // seguir preguntando. `generating` distingue esa espera de la carga
  // inicial normal.
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTokenRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  const pollRecommendations = useCallback(
    (token: number, attempt = 0) => {
      api
        .getDeals()
        .then(data => {
          if (!mountedRef.current || token !== pollTokenRef.current) return;

          if (data.status === 'pending') {
            setGenerating(true);
            if (attempt < DEALS_POLL_MAX_ATTEMPTS) {
              pollTimeoutRef.current = setTimeout(
                () => pollRecommendations(token, attempt + 1),
                DEALS_POLL_INTERVAL_MS,
              );
            } else {
              setGenerating(false);
              setError(
                'Generar recomendaciones está tardando más de lo normal. Vuelve a intentarlo en un momento.',
              );
            }
            return;
          }

          setGenerating(false);
          setRecommendations(data.recommendations ?? []);
          // "error" y "message" son mutuamente excluyentes: antes se
          // setteaban ambos al mismo texto cuando status === 'error', y
          // como DealsScreen renderiza el error (rojo) Y el message (azul)
          // en bloques separados, se veían duplicados en pantalla.
          if (data.status === 'error') {
            setMessage(null);
            setError(data.message ?? 'No se pudieron generar recomendaciones');
          } else {
            setMessage(data.message ?? null);
          }
        })
        .catch(err => {
          if (!mountedRef.current || token !== pollTokenRef.current) return;
          setGenerating(false);
          setError(
            err instanceof Error ? err.message : 'Error al obtener ofertas',
          );
        });
    },
    [],
  );

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = ++pollTokenRef.current;
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

    await api
      .getWishlistDeals()
      .then(data => {
        if (mountedRef.current) setWishlistDeals(data.deals);
      })
      .catch(() => {});

    pollRecommendations(token);

    if (mountedRef.current) setLoading(false);
  }, [pollRecommendations]);

  return {
    recommendations,
    wishlistDeals,
    loading,
    generating,
    error,
    message,
    fetchDeals,
  };
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(() =>
    loadCachedDashboard(),
  );
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
