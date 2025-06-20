// src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

// TR Pages
import LoginPageTr from '../pages/tr/LoginPage';
import RegisterPageTr from '../pages/tr/RegisterPage';
import ProductsTr from '../pages/tr/ProductsTr';
import CartPageTr from '../pages/tr/CartPage';

// EN Pages
import LoginPageEn from '../pages/en/LoginPage';
import RegisterPageEn from '../pages/en/RegisterPage';
import ProductsEn from '../pages/en/ProductsEn';
import CartPageEn from '../pages/en/CartPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* TR Routes */}
      <Route path="/tr" element={<Layout />}>
        <Route index element={<Navigate to="/tr/products/elektronik" replace />} />
        <Route path="products/:category" element={<ProductsTr />} />
        <Route path="cart" element={<CartPageTr />} />
        <Route path="login" element={<LoginPageTr />} />
        <Route path="register" element={<RegisterPageTr />} />
      </Route>

      {/* EN Routes */}
      <Route path="/en" element={<Layout />}>
        <Route index element={<Navigate to="/en/products/electronics" replace />} />
        <Route path="products/:category" element={<ProductsEn />} />
        <Route path="cart" element={<CartPageEn />} />
        <Route path="login" element={<LoginPageEn />} />
        <Route path="register" element={<RegisterPageEn />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/tr" replace />} />
    </Routes>
  );
};

export default AppRouter;
