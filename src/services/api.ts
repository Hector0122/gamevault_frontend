import type { DashboardStats, Game, IGDBGameResult, UserGame } from '../types';
import { Platform } from 'react-native';

const API_BASE = 'https://gamevaultserver-production.up.railway.app/api';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_BASE}${url}`, { headers, ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error);
  }
  return res.json();
}

// Auth
export function login(email: string, password: string) {
  return request<{ token: string; user: { id: string; email: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string) {
  return request<{ token: string; user: { id: string; email: string } }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Games
export function searchGames(query: string, offset = 0) {
  return request<IGDBGameResult[]>(`/search?q=${encodeURIComponent(query)}&offset=${offset}`);
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
  return request<{ success: boolean }>(`/games/${gameId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function updateNotes(gameId: string, data: { rating?: number | null; notes?: string | null }) {
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

export function getUserGameIds() {
  return request<{ ids: number[] }>('/games/ids');
}

export function removeGame(gameId: string) {
  return request<{ success: boolean }>(`/games/${gameId}`, { method: 'DELETE' });
}

export function imageProxyUrl(coverUrl: string): string {
  return `${API_BASE}/image-proxy?url=${encodeURIComponent(coverUrl)}`;
}
