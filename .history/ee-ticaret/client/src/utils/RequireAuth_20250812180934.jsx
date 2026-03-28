import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, isTokenExpired, logout } from '../utils/auth';
import { toast } from 'react-toastify';

export default function RequireAuth({ children }) {
  const token = getToken();

  if (!token) {
    logout();
    return <Navigate to="/tr/login" replace />;
  }

  if (isTokenExpired(token)) {
    logout();
    toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
    return <Navigate to="/tr/login" replace />;
  }

  return children;
}
