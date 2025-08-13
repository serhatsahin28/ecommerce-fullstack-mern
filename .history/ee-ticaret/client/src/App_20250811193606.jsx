import React, { useEffect } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRouter from './router/AppRouter';
import ScrollToTop from './components/common/ScrollToTop';
import { CartProvider } from './components/common/CartContext';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './utils/axios';
import api from './utils/axios';  // burası önemli

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (
          error.response?.status === 403 &&
          error.response?.data?.message === 'Oturum süresi doldu'
        ) {
          localStorage.removeItem('token');
          alert('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return (
    <>
      <ScrollToTop />
      <ToastContainer position="top-start" />
      <AppRouter />
    </>
  );
}

function App() {
  return (
