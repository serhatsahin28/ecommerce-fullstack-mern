// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getToken, setToken, logout, isTokenExpired } from '../utils/auth';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Token kontrol ve kullanıcı bilgilerini yükleme
  useEffect(() => {
    const token = getToken();

    if (!token || isTokenExpired(token)) {
      logout();
      setLoading(false);
      return;
    }

    // Axios header'a token ekle
    setToken(token);

    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          // Token geçersiz ise logout
          logout();
          setUser(null);
        } else {
          // Ağ hatası veya backend geçici hatası, logout yapma
          console.error('Auth kontrol hatası:', err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
  };

  const value = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
