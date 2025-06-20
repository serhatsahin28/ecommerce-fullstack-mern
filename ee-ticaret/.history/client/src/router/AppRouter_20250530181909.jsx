// src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

// TR Pages
import HomeTR from '../pages/tr/Home';
import ProductsTR from '../pages/tr/ProductsTr';
import ProductDetailTR from '../pages/tr/ProductDetail';

// EN Pages
import HomeEN from '../pages/en/Home';
import ProductsEN from '../pages/en/ProductsEn';
import ProductDetailEN from '../pages/en/ProductDetail';

export default function AppRouter() {
  const location = useLocation();
  const language = location.pathname.split('/')[1] || 'tr';

  return (
    <Routes>
      {/* Redirect root to default language */}
      <Route path="/" element={<Navigate to="/tr" />} />

      {/* TR Routes */}
      <Route path="/tr" element={<Layout />}>
        <Route index element={<HomeTR />} />
        <Route path=":category" element={<ProductsTR />} />  {/* Kategoriye göre */}
        {/* <Route path="products/:id" element={<ProductDetailTR />} /> */}
      </Route>

      {/* EN Routes */}
      <Route path="/en" element={<Layout />}>
        <Route index element={<HomeEN />} />
        <Route path=":category" element={<ProductsEN />} />
        <Route path="products/:id" element={<ProductDetailEN />} />
      </Route>

      {/* Not found fallback */}
      <Route path="*" element={<Navigate to={`/${language}`} />} />
    </Routes>
  );
}
