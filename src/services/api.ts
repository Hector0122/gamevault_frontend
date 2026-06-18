import type { DashboardStats, Game, IGDBGameResult, UserGame } from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error);
  }
  return res.json();
}

export function searchGames(query: string) {
  return request<IGDBGameResult[]>(`/search?q=${encodeURIComponent(query)}`);
}

export function addGame(externalId: number) {
  return request<Game>('/games', {
    method: 'POST',
    body: JSON.stringify({ externalId }),
  });
}

export function getLibrary() {
  return request<UserGame[]>('/games');
}

export function updateStatus(gameId: string, status: string) {
  return request<UserGame>(`/games/${gameId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getDashboard() {
  return request<DashboardStats>('/dashboard');
}
