import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRouter from './router/AppRouter';
import ScrollToTop from './components/common/ScrollToTop';
import { CartProvider } from './components/common/CartContext';
import Footer from './components/layout/Footer';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // yukarıda yazdığın css buradaysa

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <CartProvider>
        <Router>
          <div id="app-wrapper">
            <ScrollToTop />
            <div className="main-content">
              <AppRouter />
            </div>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </I18nextProvider>
  );
}

export default App;
