import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to load session
  const restoreSession = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await authService.getMe();
      // data contains { user, profile }
      setCurrentUser(data);
    } catch (error) {
      console.error('Failed to restore session:', error);
      // Clear token since it is invalid or expired
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();

    // Listen to global logout events from Axios Interceptor (401 error handler)
    const handleGlobalLogout = () => {
      setCurrentUser(null);
    };

    window.addEventListener('auth_logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth_logout', handleGlobalLogout);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      // data contains { access_token, user, profile, expires_in, token_type }
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify({ user: data.user, profile: data.profile }));
      
      const sessionData = { user: data.user, profile: data.profile };
      setCurrentUser(sessionData);
      return sessionData;
    } catch (error) {
      setCurrentUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.profile?.role === 'admin',
    login,
    logout,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
