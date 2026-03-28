import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, isTokenExpired, logout } from './auth'; // yolunu kontrol et

export default function RequireAuth({ children, lang = 'tr' }) {
  const token = getToken();

if (token && isTokenExpired(token)) {
  logout();
  return <Navigate to={`/${lang}/login`} replace state={{ expired: true, message: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.' }} />;
}

// if (!token) {
//   logout();
//   return <Navigate to={`/${lang}/login`} replace state={{ expired: true, message: 'Lütfen giriş yapın.' }} />;
// }


  return children;
}
