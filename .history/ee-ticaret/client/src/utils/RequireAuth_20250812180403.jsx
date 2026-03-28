import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, isTokenExpired, logout } from '../utils/auth';

export default function RequireAuth({ children }) {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    logout();
    return <Navigate to="/tr/login" replace />;
  }

  return children;
}
