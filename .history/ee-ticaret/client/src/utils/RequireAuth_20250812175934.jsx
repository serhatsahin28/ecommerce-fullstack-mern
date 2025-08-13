import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, logout } from '../utils/auth';
import jwtDecode from 'jwt-decode';

const RequireAuth = ({ children }) => {
  const token = getToken();

  if (!token) {
    logout();
    return <Navigate to="/login" replace />;
  }

  try {
    const { exp } = jwtDecode(token);
    const now = Date.now() / 1000;

    if (exp < now) {
      logout();
      return <Navigate to="/login" replace />;
    }
  } catch {
    logout();
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
