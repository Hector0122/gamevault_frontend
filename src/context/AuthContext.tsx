import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createMMKV } from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';
import * as api from '../services/api';

// MMKV solo guarda datos no sensibles (perfil); los tokens viven en Keychain.
const storage = createMMKV({ id: 'gamevault' });
const KEYCHAIN_SERVICE = 'gamevault.auth';

interface Tokens {
  token: string;
  refreshToken: string;
}

async function getStoredTokens(): Promise<Tokens | null> {
  const creds = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
  if (!creds) return null;
  try {
    return JSON.parse(creds.password);
  } catch {
    return null;
  }
}

async function setStoredTokens(tokens: Tokens): Promise<void> {
  await Keychain.setGenericPassword('auth', JSON.stringify(tokens), {
    service: KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function clearSession() {
    // Revoca el refresh token en el servidor; best-effort, la sesión local
    // se limpia igual si esto falla (token ya vencido, sin red, etc).
    await api.logout().catch(() => {});
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    storage.remove('user');
    setToken(null);
    api.setTokens(null, null);
    setUser(null);
  }

  useEffect(() => {
    // Limpieza de la migración MMKV → Keychain: borra el token en texto
    // plano que versiones anteriores dejaron en disco. Idempotente.
    storage.remove('token');

    api.setAuthCallbacks({
      onTokensRefreshed: (t, r) => {
        setToken(t);
        setStoredTokens({ token: t, refreshToken: r }).catch(() => {});
      },
      onSessionExpired: () => {
        clearSession();
      },
    });

    getStoredTokens()
      .then((tokens) => {
        if (tokens) {
          setToken(tokens.token);
          api.setTokens(tokens.token, tokens.refreshToken);
          const u = storage.getString('user');
          if (u) setUser(JSON.parse(u));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    await setStoredTokens({ token: res.token, refreshToken: res.refreshToken });
    storage.set('user', JSON.stringify(res.user));
    setToken(res.token);
    api.setTokens(res.token, res.refreshToken);
    setUser(res.user);
  }

  async function register(email: string, password: string) {
    const res = await api.register(email, password);
    await setStoredTokens({ token: res.token, refreshToken: res.refreshToken });
    storage.set('user', JSON.stringify(res.user));
    setToken(res.token);
    api.setTokens(res.token, res.refreshToken);
    setUser(res.user);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout: clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
