import axios from 'axios';

const api = axios.create({
  baseURL: '/tr/account',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  }
});

let navigateFunction = null;

export const injectNavigate = (navigate) => {
  navigateFunction = navigate;
};

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403 && error.response?.data?.message === 'Oturum süresi doldu') {
      localStorage.removeItem('token');
      alert('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      if (navigateFunction) {
        navigateFunction('/tr/login');
      } else {
        window.location.href = '/tr/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
