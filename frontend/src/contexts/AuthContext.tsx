import {
  createContext, useEffect, useState, useMemo,
} from 'react';
import api from '@/lib/api';
import type { User } from '@/types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('access_token'));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    api.get<User>('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => {
        localStorage.removeItem('access_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const saveToken = (t: string): void => {
    localStorage.setItem('access_token', t);
    setToken(t);
  };

  const login = async (username: string, password: string): Promise<void> => {
    const { data } = await api.post<{ access_token: string }>('/auth/login', { username, password });
    saveToken(data.access_token);
  };

  const register = async (username: string, password: string): Promise<void> => {
    const { data } = await api.post<{ access_token: string }>('/auth/register', { username, password });
    saveToken(data.access_token);
  };

  const logout = (): void => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user, token, isLoading, login, register, logout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, isLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
