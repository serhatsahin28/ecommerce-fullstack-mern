import React, { createContext, useState, useEffect } from 'react';
import { getToken, logout, isTokenExpired } from '../utils/auth';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      if (isTokenExpired(token)) {
        logout();
      } else {
        api.get('/auth/me')
          .then(res => setUser(res.data))
          .catch(() => logout());
      }
    }
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
