import axios from 'axios';

const api = axios.create({
    baseURL: '/tr/account',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
});

export default api;
