import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import api, { TOKEN_KEY } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True until the one-request session restore settles, so ProtectedRoute does
  // not bounce a logged-in user to /login while it is in flight.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        // Expired or tampered token. Fail silently and render logged out.
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function persist({ token, user: nextUser }) {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
    return nextUser;
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return persist(data);
  }

  async function signup(fields) {
    const { data } = await api.post('/auth/signup', fields);
    return persist(data);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
