// src/utils/auth.js

export const isAuthenticated = () => {
  return !!localStorage.getItem('token'); // örneğin JWT varsa giriş yapılmış
};
