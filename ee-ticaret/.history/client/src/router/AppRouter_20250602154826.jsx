import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import HomeTR from '../pages/tr/Home';
import ProductsTR from '../pages/tr/ProductsTr';
import ProductDetailTR from '../pages/tr/ProductDetail';
import NotFoundTr from '../pages/tr/notFound';

import HomeEN from '../pages/en/Home';
import ProductsEN from '../pages/en/ProductsEn';
import ProductDetailEN from '../pages/en/ProductDetail';
import NotFoundEn from '../pages/en/notFound';

import CartPage from '../pages/CartPage';


export default function AppRouter() {
  const language = (useLocation().pathname.split('/')[1] || 'tr');

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tr" replace />} />

      {/* TR */}
      <Route path="/tr" element={<Layout />}>
        <Route index element={<HomeTR />} />
        <Route path=":category" element={<ProductsTR />} />
        <Route path="products/:id" element={<ProductDetailTR />} />
        <Route path="*" element={<NotFoundTr />} />
        <Route path="404" element={<NotFoundTr />} />

      </Route>

      {/* EN */}
      <Route path="/en" element={<Layout />}>
        <Route index element={<HomeEN />} />
        <Route path=":category" element={<ProductsEN />} />
        <Route path="products/:id" element={<ProductDetailEN />} />
        <Route path="*" element={<NotFoundEn />} />
        <Route path="404" element={<NotFoundEn />} />

      </Route>

      {/* Fallback */}
      {/* <Route path="*" element={<Navigate to={`/${language}`} replace />} /> */}
      <Route path="*" element={<NotFoundEn />} />

    </Routes>
  );
}
