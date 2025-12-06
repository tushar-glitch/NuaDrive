import React, { createContext, useContext, useState, useEffect } from 'react';
// import { request } from '../lib/api';

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
       // Optional: specific logout endpoint if needed later
       // await request('/auth/logout', { method: 'POST' });
       
       // For now, just clear client state as cookie is httpOnly 
       // (Real logout needs backend to clear cookie, let's add that endpoint soon)
       setUser(null);
       localStorage.removeItem('user');
       
       // Force reload to clear any memory states or redirect
       window.location.href = '/login';
    } catch (error) {
       console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
