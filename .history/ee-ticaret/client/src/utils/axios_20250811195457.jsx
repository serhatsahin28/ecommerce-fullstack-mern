import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/login',  // Burayı değiştir
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
});

export default api;
