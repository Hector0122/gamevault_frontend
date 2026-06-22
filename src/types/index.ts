export interface Game {
  id: string;
  externalId: number;
  title: string;
  description: string;
  coverUrl: string;
  releaseDate: string;
  platforms: string[];
  genres: string[];
  timeToBeatHastly: number | null;
  timeToBeatNormally: number | null;
  timeToBeatCompletely: number | null;
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
  createdAt: string;
  updatedAt: string;
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
  estimatedHoursRemaining: number;
}

export interface DealRecommendation {
  title: string;
  inLibrary: boolean;
  coverUrl: string | null;
  genres: string[];
  platforms: string[];
  deal: {
    currentPrice: number;
    regularPrice: number;
    discount: number;
    store: string;
    url: string;
  } | null;
}

export interface IGDBGameResult {
  id: number;
  name: string;
  summary?: string;
  cover?: { url: string };
  first_release_date?: number;
  platforms?: { name: string }[];
  genres?: { name: string }[];
  time_to_beat?: {
    hastily: number | null;
    normally: number | null;
    completely: number | null;
  } | null;
}
