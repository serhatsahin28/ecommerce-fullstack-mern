import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import AdminHome from '../pages/admin/Home';
// import Orders from '../pages/admin/Orders';
import Products from '../pages/admin/Products';
import AdminLayout from '../pages/admin/AdminLayout';




// TR pages
import HomeTR from '../pages/tr/Home';
import ProductsTR from '../pages/tr/ProductsTr';
import ProductDetailTR from '../pages/tr/ProductDetail';
import CartPageTR from '../pages/tr/CartPage';
import LoginTR from '../pages/tr/LoginPage';
import RegisterTR from '../pages/tr/RegisterPage';
import NotFoundTr from '../pages/tr/NotFound';
import ProfileTR from '../pages/tr/Profile';
import GuestInfo from '../pages/tr/guestInfoPage';
import PaymentPage from '../pages/tr/paymentPage';


// EN pages
import HomeEN from '../pages/en/Home';
import ProductsEN from '../pages/en/ProductsEn';
import ProductDetailEN from '../pages/en/ProductDetail';
import CartPageEN from '../pages/en/CartPage';
import LoginEN from '../pages/en/LoginPage';
import RegisterEN from '../pages/en/RegisterPage';
import NotFoundEn from '../pages/en/NotFound';
import ProfileEN from '../pages/en/Profile';


export default function AppRouter() {
  const language = useLocation().pathname.split('/')[1];

  // ✅ Eğer dil tr veya en değilse, doğrudan 404'e yönlendir
  if (language && !['tr', 'en', 'admin'].includes(language)) {
    return <Navigate to="/tr/404" replace />;
  }

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
        <Route path="account" element={<ProfileTR />} />
        <Route path="guestInfo" element={<GuestInfo />} />
        <Route path="guestInfo" element={<GuestInfo />} />

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
        <Route path="account" element={<ProfileEN />} />

        <Route path="404" element={<NotFoundEn />} />
      </Route>

      <Route path='/admin' element={<AdminLayout />}>
        <Route index element={< AdminHome />} />
        <Route path="products" index element={< Products />} />
        


      </Route>


      {/* Fallback */}
      <Route path="*" element={<Navigate to={`/${language || 'tr'}/404`} replace />} />
    </Routes>
  );
}
