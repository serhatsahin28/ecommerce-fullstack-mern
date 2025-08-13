import React, { createContext, useState, useEffect } from 'react';

// Context oluşturuluyor
export const AuthContext = createContext();

// Provider, çocuk bileşenlere token, login ve logout fonksiyonlarını sağlar
export const AuthProvider = ({ children }) => {
  // Başlangıçta localStorage’dan token varsa al, yoksa null
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Logout fonksiyonu: token silinir, state güncellenir
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Login fonksiyonu: token kaydedilir, state güncellenir
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  // Sayfa yenilendiğinde localStorage'dan token varsa set et (state güncelle)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
