import axios from 'axios';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403 && error.response?.data?.message === 'Oturum süresi doldu') {
      localStorage.removeItem('token');
      alert('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
