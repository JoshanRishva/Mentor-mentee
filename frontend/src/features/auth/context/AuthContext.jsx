import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

/**
 * AuthContext — cookie-based session (JWT stored in httpOnly cookie by backend)
 */
export const AuthContext = createContext(null);

const getErrorMessage = (err, fallback) =>
  err?.message || err?.response?.data?.message || fallback;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const register = useCallback(async (registerData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(registerData);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Registration failed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);

      if (!response?.success || !response?.user) {
        throw new Error(response?.message || 'Login failed');
      }

      localStorage.setItem('user', JSON.stringify(response.user));

      if (rememberMe) {
        localStorage.setItem(
          'rememberMe',
          JSON.stringify({ email, savedAt: new Date().toISOString() })
        );
      } else {
        localStorage.removeItem('rememberMe');
      }

      setUser(response.user);
      setIsAuthenticated(true);

      return { success: true, data: response };
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Login failed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Logout failed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    register,
    login,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
