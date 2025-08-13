// src/utils/auth.js

export const isAuthenticated = () => {
  return !!localStorage.getItem('token'); // örneğin JWT varsa giriş yapılmış
};
// utils/auth.jsx
export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login'; // direkt login sayfasına yönlendirme
}

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}
