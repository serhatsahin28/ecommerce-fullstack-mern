import React, { useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, isTokenExpired, logout } from './auth';
import { toast } from 'react-toastify';

export default function RequireAuth({ children, lang }) {
  const toastShown = useRef(false);
  const token = getToken();

  // Token yoksa
  if (!token) {
    if (!toastShown.current) {
      toast.error('Lütfen giriş yapın.');
      toastShown.current = true;
    }
    logout();
    return <Navigate to={`/${lang}/login`} replace />;
  }

  // Token süresi dolmuşsa
  if (isTokenExpired(token)) {
    if (!toastShown.current) {
      toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      toastShown.current = true;
    }
    logout();
    return <Navigate to={`/${lang}/login`} replace />;
  }

  return children;
}
