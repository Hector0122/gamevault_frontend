import { createMMKV } from 'react-native-mmkv';
import * as api from './api';
import { NetworkError } from './api';

// Cambios hechos sin conexión (cambiar estado, horas, notas, prioridad) se
// guardan aquí en vez de perderse. Se reintentan la próxima vez que se
// refresca la biblioteca y hay señal.
const store = createMMKV({ id: 'gamevault_cache' });
const QUEUE_KEY = 'pending_mutations';

export type PendingMutation =
  | { id: string; ts: number; type: 'status'; gameId: string; status: string }
  | {
      id: string;
      ts: number;
      type: 'hours';
      gameId: string;
      hoursPlayed: number;
    }
  | {
      id: string;
      ts: number;
      type: 'notes';
      gameId: string;
      data: { rating?: number | null; notes?: string | null };
    }
  | {
      id: string;
      ts: number;
      type: 'priority';
      gameId: string;
      priority: string | null;
    };

function loadQueue(): PendingMutation[] {
  const raw = store.getString(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveQueue(queue: PendingMutation[]) {
  store.set(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueMutation(
  mutation:
    | { type: 'status'; gameId: string; status: string }
    | { type: 'hours'; gameId: string; hoursPlayed: number }
    | {
        type: 'notes';
        gameId: string;
        data: { rating?: number | null; notes?: string | null };
      }
    | { type: 'priority'; gameId: string; priority: string | null },
) {
  const queue = loadQueue();
  queue.push({
    ...mutation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ts: Date.now(),
  } as PendingMutation);
  saveQueue(queue);
}

export function getPendingMutationCount(): number {
  return loadQueue().length;
}

function applyMutation(m: PendingMutation) {
  switch (m.type) {
    case 'status':
      return api.updateStatus(m.gameId, m.status);
    case 'hours':
      return api.updateHours(m.gameId, m.hoursPlayed);
    case 'notes':
      return api.updateNotes(m.gameId, m.data);
    case 'priority':
      return api.updatePriority(m.gameId, m.priority);
  }
}

// Si el mismo juego tiene varios cambios pendientes del mismo tipo (p. ej.
// cambiaste el estado dos veces sin señal), solo importa reenviar el último
// — así no se reproducen valores intermedios ya obsoletos fuera de orden.
function coalesce(queue: PendingMutation[]): PendingMutation[] {
  const lastByKey = new Map<string, PendingMutation>();
  for (const m of queue) {
    lastByKey.set(`${m.type}:${m.gameId}`, m);
  }
  return Array.from(lastByKey.values()).sort((a, b) => a.ts - b.ts);
}

let flushing = false;

export async function flushMutationQueue(): Promise<{
  synced: number;
  remaining: number;
}> {
  if (flushing) return { synced: 0, remaining: getPendingMutationCount() };
  flushing = true;
  try {
    const queue = coalesce(loadQueue());
    let synced = 0;
    let stillPending: PendingMutation[] = [];

    for (let i = 0; i < queue.length; i++) {
      const m = queue[i];
      try {
        await applyMutation(m);
        synced++;
      } catch (err) {
        if (err instanceof NetworkError) {
          // Seguimos sin señal: dejamos este y el resto para el próximo
          // intento, en el mismo orden.
          stillPending = queue.slice(i);
          break;
        }
        // El servidor rechazó el cambio (400/401/etc) — reintentarlo no va
        // a arreglarlo, así que lo descartamos en vez de reintentarlo para
        // siempre.
        console.warn(
          '[mutationQueue] descartando mutación tras rechazo del servidor:',
          err,
        );
      }
    }

    saveQueue(stillPending);
    return { synced, remaining: stillPending.length };
  } finally {
    flushing = false;
  }
}
