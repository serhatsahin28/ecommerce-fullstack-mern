import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRouter from './router/AppRouter';
import ScrollToTop from './components/common/ScrollToTop';
import { CartProvider } from './components/common/CartContext';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import api from './utils/axios';
import { AuthProvider, AuthContext } from './context/AuthContext';

function AppContent() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // logout fonksiyonunu alıyoruz

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (
          error.response?.status === 403 &&
          error.response?.data?.message === 'Oturum süresi doldu'
        ) {
          logout(); // context logout çağrılır
          alert('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
          navigate('/tr/login'); // yönlendirme yapılır
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate, logout]);

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
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
