import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}', // backend base URL’nizi buraya yazın
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  }
});

export default api;
