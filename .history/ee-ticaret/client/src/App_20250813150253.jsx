// App.jsx
import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRouter from './router/AppRouter';
import ScrollToTop from './components/common/ScrollToTop';
import { CartProvider } from './components/common/CartContext';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import api from './utils/axios';
import { AuthProvider, AuthContext } from './context/AuthContext';

function AppContent() {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          const message = error.response?.data?.message;

          // Oturum süresi doldu kontrolü
          if (
            message === 'Oturum süresi doldu' ||
            message === 'Token expired' ||
            message === 'Invalid token' ||
            error.response?.status === 401
          ) {
            logout();
            toast.error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
            navigate('/tr/login');
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, logout]);

  return (
    <>
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false} // Üzerine gelince durmasın
      />

      <AppRouter />
    </>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>   {/* Router en üstte */}
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </Router>
    </I18nextProvider>
  );
}


export default App;