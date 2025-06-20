import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRouter from './router/AppRouter';
import ScrollToTop from './components/common/ScrollToTop';
import { CartProvider } from './components/common/CartContext';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <CartProvider>
        <Router>
          <ScrollToTop />
         <ToastContainer
  position="top-start"
  className="p-2"
  style={{ zIndex: 1056, opacity: 0.95 }}
>
  <Toast
    show={showToast}
    onClose={() => setShowToast(false)}
    bg="success"
    delay={1500}
    autohide
  >
    <Toast.Header closeButton={false}>
      <strong className="me-auto">✔ {t('add_to_cart')}</strong>
    </Toast.Header>
    <Toast.Body className="text-white">
      {t('added_to_cart') || 'Ürün sepete eklendi!'}
    </Toast.Body>
  </Toast>
</ToastContainer>
          <AppRouter />
        </Router>
      </CartProvider>
    </I18nextProvider>
  );
}

export default App;
