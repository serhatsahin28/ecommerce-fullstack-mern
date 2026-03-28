import React, { useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, isTokenExpired, logout } from '../utils/auth';
import { toast } from 'react-toastify';

export default function RequireAuth({ children }) {
  const toastShown = useRef(false);
  const token = getToken();

  if (!token) {
    if (!toastShown.current) {
      toast.error('Lütfen giriş yapın.');
      toastShown.current = true;
    }
    logout();
    return <Navigate to="/tr/login" replace />;
  }

  if (isTokenExpired(token)) {
    if (!toastShown.current) {
      toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      toastShown.current = true;
    }
    logout();
    return <Navigate to="/tr/login" replace />;
  }

  return children;
}
