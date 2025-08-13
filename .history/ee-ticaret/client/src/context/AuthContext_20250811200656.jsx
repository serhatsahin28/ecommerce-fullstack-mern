// context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Logout fonksiyonu
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    // İsteğe bağlı: Diğer kullanıcı bilgilerini de temizleyebilirsiniz
    // localStorage.removeItem('userInfo');
  };

  // Login fonksiyonu
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  // Token kontrolü
  const checkToken = () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    } else {
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  // Sayfa yenilendiğinde token kontrolü
  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        isAuthenticated, 
        login, 
        logout, 
        checkToken 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};