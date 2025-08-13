// components/RequireAuth.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, logout } from '../utils/auth';

const RequireAuth = ({ children, lang }) => {
  const token = getToken();

  if (!token) {
    logout();
    return <Navigate to={`/${lang}/login`} replace />;
  }

  return children;
};

export default RequireAuth;
