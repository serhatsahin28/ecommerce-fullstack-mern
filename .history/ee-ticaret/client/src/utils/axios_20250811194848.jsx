import axios from 'axios';

const api = axios.create({
    baseURL: '/tr/login',  // Burayı değiştir
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
});

export default api;
