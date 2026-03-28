import { useNavigate } from 'react-router-dom';

export function logout(navigate) {
  localStorage.removeItem('token');
  navigate('/tr/login');
}

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch {
    return true; // Token bozuksa expired say
  }
}
// src/utils/auth.jsx içine ekle
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}
// utils/auth.jsx
export const getToken = () => localStorage.getItem('token');

export const logout = () => {
  localStorage.removeItem('token');
};
