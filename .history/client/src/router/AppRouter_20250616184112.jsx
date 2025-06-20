// src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

// TR pages
import HomeTR from '../pages/tr/Home';
import ProductsTR from '../pages/tr/ProductsTr';
import ProductDetailTR from '../pages/tr/ProductDetail';
import CartPageTR from '../pages/tr/CartPage';
import LoginTR from '../pages/tr/LoginPage';
import RegisterTR from '../pages/tr/RegisterPage';
import NotFoundTr from '../pages/tr/NotFound';

// EN pages
import HomeEN from '../pages/en/Home';
import ProductsEN from '../pages/en/ProductsEn';
import ProductDetailEN from '../pages/en/ProductDetail';
import CartPageEN from '../pages/en/CartPage';
import LoginEN from '../pages/en/LoginPage';
import RegisterEN from '../pages/en/RegisterPage';
import NotFoundEn from '../pages/en/NotFound';

export default function AppRouter() {
  const language = useLocation().pathname.split('/')[1] || 'tr';

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tr" replace />} />

      {/* TR Routes */}
      <Route path="/tr" element={<Layout />}>
        <Route index element={<HomeTR />} />
        <Route path=":category" element={<ProductsTR />} />
        <Route path=":category/:id" element={<ProductDetailTR />} />
        <Route path="cart" element={<CartPageTR />} />
        <Route path="login" element={<LoginTR />} />
        <Route path="register" element={<RegisterTR />} />
        <Route path="404" element={<NotFoundTr />} />
      </Route>

      {/* EN Routes */}
      <Route path="/en" element={<Layout />}>
        <Route index element={<HomeEN />} />
        <Route path=":category" element={<ProductsEN />} />
        <Route path=":category/:id" element={<ProductDetailEN />} />
        <Route path="cart" element={<CartPageEN />} />
        <Route path="login" element={<LoginEN />} />
        <Route path="register" element={<RegisterEN />} />
        <Route path="404" element={<NotFoundEn />} />
        <Route path="*" element={<NotFoundEn />} />
        
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={`/${language}`} replace />} />
        <Route path="" element={<NotFoundEn />} />

    </Routes>
  );
}
