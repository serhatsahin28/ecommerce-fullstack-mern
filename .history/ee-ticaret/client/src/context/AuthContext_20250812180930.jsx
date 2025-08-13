import React, { createContext, useState, useEffect } from 'react';
import { getToken, setToken, logout } from '../utils/auth';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // yeni: yüklenme durumu

  useEffect(() => {
    const token = getToken();
    if (token) {
      setToken(token); // otomatik logout timer kurar
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false)); // yüklenme bitti
    } else {
      setLoading(false); // token yoksa da yüklenme bitti
    }
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
  };

  const value = { user, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
