import { useState, useEffect } from 'react';
import { AuthContext } from './authContextInstance.js';
import authApi from '../api/authApi.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('kisansetu_token'));
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('kisansetu_token')));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const savedToken = localStorage.getItem('kisansetu_token');

    if (!savedToken) {
      return;
    }

    authApi
      .getCurrentUser()
      .then((response) => {
        if (isMounted) {
          if (response?.data?.user) {
            setUser(response.data.user);
            setToken(savedToken);
          } else {
            localStorage.removeItem('kisansetu_token');
            setUser(null);
            setToken(null);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[KisanSetu Auth] Session verification failed:', err.message);
          localStorage.removeItem('kisansetu_token');
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authApi.login(credentials);
      const { user: authUser, token: authToken } = response.data;

      localStorage.setItem('kisansetu_token', authToken);
      setToken(authToken);
      setUser(authUser);
      return authUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authApi.register(userData);
      const { user: authUser, token: authToken } = response.data;

      localStorage.setItem('kisansetu_token', authToken);
      setToken(authToken);
      setUser(authUser);
      return authUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('[KisanSetu Auth] Server logout call failed, proceeding with local purge:', err.message);
    } finally {
      localStorage.removeItem('kisansetu_token');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response?.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('[KisanSetu Auth] Failed to refresh user profile:', err.message);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
