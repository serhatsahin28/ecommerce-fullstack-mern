import axios from 'axios';
import { getToken, logout, isTokenExpired } from './auth';

// API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    if (isTokenExpired(token)) {
      // Token süresi dolmuş → logout + sepet temizle
      localStorage.removeItem('cart');
      logout();
      window.dispatchEvent(new Event('tokenExpired'));
      return Promise.reject(new Error('Token expired'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Yetkisiz → token ve sepeti temizle
      localStorage.removeItem('cart');
      logout();
      window.dispatchEvent(new Event('tokenExpired'));
    }
    return Promise.reject(error);
  }
);

export default api;
