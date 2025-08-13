// utils/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Request interceptor - her istekte token'ı header'a ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;