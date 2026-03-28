import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // backend base URL’nizi buraya yazın
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  }
});

export default api;
