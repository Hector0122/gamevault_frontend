import type {
  DashboardStats,
  DealRecommendation,
  Game,
  IGDBGameResult,
  UserGame,
} from '../types';

const API_BASE = 'https://gamevaultserver-production.up.railway.app/api';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

// Distingue "no hay conexión / el fetch ni llegó al servidor" de un error
// lógico que el servidor sí respondió (400, 401, etc). Solo el primero tiene
// sentido reintentar más tarde desde una cola de sincronización offline.
export class NetworkError extends Error {}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`, { headers, ...options });
  } catch (err) {
    throw new NetworkError(
      err instanceof Error ? err.message : 'Network request failed',
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error);
  }
  return res.json();
}

// Auth
export function login(email: string, password: string) {
  return request<{ token: string; user: { id: string; email: string } }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
  );
}

export function register(email: string, password: string) {
  return request<{ token: string; user: { id: string; email: string } }>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
  );
}

// Games
export function searchGames(query: string, offset = 0) {
  return request<IGDBGameResult[]>(
    `/search?q=${encodeURIComponent(query)}&offset=${offset}`,
  );
}

export function addGame(externalId: number) {
  return request<Game>('/games', {
    method: 'POST',
    body: JSON.stringify({ externalId }),
  });
}

export function getLibrary(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  platform?: string;
  genre?: string;
  sort?: string;
}) {
  const q = new URLSearchParams();
  if (params) {
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    if (params.platform) q.set('platform', params.platform);
    if (params.genre) q.set('genre', params.genre);
    if (params.sort) q.set('sort', params.sort);
  }
  return request<{
    games: UserGame[];
    total: number;
    page: number;
    limit: number;
  }>(`/games?${q.toString()}`);
}

export function updateStatus(gameId: string, status: string) {
  return request<{ success: boolean }>(`/games/${gameId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function updateNotes(
  gameId: string,
  data: { rating?: number | null; notes?: string | null },
) {
  return request<{ success: boolean }>(`/games/${gameId}/notes`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function updateHours(gameId: string, hoursPlayed: number) {
  return request<{ success: boolean }>(`/games/${gameId}/hours`, {
    method: 'PATCH',
    body: JSON.stringify({ hoursPlayed }),
  });
}

export function getDashboard() {
  return request<DashboardStats>('/dashboard');
}

export function getDeals() {
  return request<{
    status?: 'pending' | 'ready' | 'error';
    recommendations: DealRecommendation[];
    message?: string;
  }>('/deals');
}

export function getWishlistDeals() {
  return request<{ deals: import('../types').WishlistDeal[] }>(
    '/deals/wishlist',
  );
}

export function getUserGameIds() {
  return request<{ ids: number[] }>('/games/ids');
}

export function removeGame(gameId: string) {
  return request<{ success: boolean }>(`/games/${gameId}`, {
    method: 'DELETE',
  });
}

export function updatePriority(gameId: string, priority: string | null) {
  return request<{ success: boolean }>(`/games/${gameId}/priority`, {
    method: 'PATCH',
    body: JSON.stringify({ priority }),
  });
}

export function exportUrl(params?: {
  search?: string;
  status?: string;
  platform?: string;
  genre?: string;
  sort?: string;
}): string {
  const q = new URLSearchParams();
  if (params) {
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    if (params.platform) q.set('platform', params.platform);
    if (params.genre) q.set('genre', params.genre);
    if (params.sort) q.set('sort', params.sort);
  }
  const token = authToken ? `&token=${encodeURIComponent(authToken)}` : '';
  return `${API_BASE}/export?${q.toString()}${token}`;
}

export function imageProxyUrl(coverUrl: string): string {
  return `${API_BASE}/image-proxy?url=${encodeURIComponent(coverUrl)}`;
}
