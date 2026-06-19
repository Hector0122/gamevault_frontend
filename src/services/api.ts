import type { DashboardStats, Game, IGDBGameResult, UserGame } from '../types';

import { Platform } from 'react-native';

const BASE = Platform.select({
  android: 'http://10.0.2.2:3001/api',
  ios: 'http://localhost:3001/api',
  default: 'http://localhost:3001/api',
});

// Override with Railway URL in production
const API_BASE = __DEV__ ? BASE : 'https://gamevaultserver-production.up.railway.app/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
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
