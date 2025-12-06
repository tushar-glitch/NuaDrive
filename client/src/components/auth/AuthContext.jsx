import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
       await auth.logout();
       setUser(null);
       localStorage.removeItem('user');
       window.location.href = '/login';
    } catch (error) {
       console.error("Logout failed", error);
       // Fallback checkout even if API fails
       setUser(null);
       localStorage.removeItem('user');
       window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
