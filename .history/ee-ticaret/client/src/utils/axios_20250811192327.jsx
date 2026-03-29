import axios from 'axios';

const api = axios.create({
    // baseURL:`${import.meta.env.VITE_API_URL}/profile',
    baseURL:'/tr/account',

    headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
});

export default api;
