import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';

// TR Pages
import HomeTR from '../pages/tr/Home';
import ProductsTR from '../pages/tr/Products';
import ProductDetailTR from '../pages/tr/ProductDetail';
import CategoriesTR from '../pages/tr/Categories';

// EN Pages
import HomeEN from '../pages/en/Home';
import ProductsEN from '../pages/en/Products';
import ProductDetailEN from '../pages/en/ProductDetail';
import CategoriesEN from '../pages/en/Categories';

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
        <Route path="products" element={<ProductsTR />} />
        <Route path="products/:id" element={<ProductDetailTR />} />
        <Route path="categories" element={<CategoriesTR />} />
      </Route>

      {/* EN Routes */}
      <Route path="/en" element={<Layout />}>
        <Route index element={<HomeEN />} />
        <Route path="products" element={<ProductsEN />} />
        <Route path="products/:id" element={<ProductDetailEN />} />
        <Route path="categories" element={<CategoriesEN />} />
      </Route>

      {/* Not found fallback */}
      <Route path="*" element={<Navigate to={`/${language}`} />} />
    </Routes>
  );
}
