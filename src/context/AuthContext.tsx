import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createMMKV } from 'react-native-mmkv';
import * as api from '../services/api';

const storage = createMMKV({ id: 'gamevault' });

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

  useEffect(() => {
    const t = storage.getString('token');
    if (t) {
      setToken(t);
      api.setToken(t);
      const u = storage.getString('user');
      if (u) setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    storage.set('token', res.token);
    storage.set('user', JSON.stringify(res.user));
    setToken(res.token);
    api.setToken(res.token);
    setUser(res.user);
  }

  async function register(email: string, password: string) {
    const res = await api.register(email, password);
    storage.set('token', res.token);
    storage.set('user', JSON.stringify(res.user));
    setToken(res.token);
    api.setToken(res.token);
    setUser(res.user);
  }

  async function logout() {
    storage.remove('token');
    storage.remove('user');
    setToken(null);
    api.setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
