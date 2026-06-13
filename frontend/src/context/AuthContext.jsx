import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [initializing, setInitializing] = useState(true);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      return false;
    }

    try {
      const me = await authApi.getMe();
      localStorage.setItem('user', JSON.stringify(me));
      setToken(storedToken);
      setUser(me);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  useEffect(() => {
    const init = async () => {
      if (localStorage.getItem('token')) {
        await restoreSession();
      }
      setInitializing(false);
    };
    init();
  }, [restoreSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      restoreSession,
      isAuthenticated: Boolean(user && token),
      initializing,
    }),
    [user, token, login, logout, restoreSession, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
