export interface Game {
  id: string;
  externalId: number;
  title: string;
  description: string;
  coverUrl: string;
  releaseDate: string;
  platforms: string[];
  genres: string[];
}

export interface UserGame {
  id: string;
  gameId: string;
  status: GameStatus;
  rating: number | null;
  notes: string | null;
  hoursPlayed: number | null;
  startedAt: string | null;
  completedAt: string | null;
  game: Game;
}

export type GameStatus = 'WISHLIST' | 'OWNED' | 'PLAYING' | 'COMPLETED' | 'DROPPED';

export interface DashboardStats {
  total: number;
  WISHLIST: number;
  OWNED: number;
  PLAYING: number;
  COMPLETED: number;
  DROPPED: number;
}

export interface IGDBGameResult {
  id: number;
  name: string;
  summary?: string;
  cover?: { url: string };
  first_release_date?: number;
  platforms?: { name: string }[];
  genres?: { name: string }[];
}
