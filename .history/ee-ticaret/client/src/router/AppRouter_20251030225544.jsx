import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import AdminHome from '../pages/admin/Home';
import Products from '../pages/admin/Products';
import AdminLayout from '../pages/admin/AdminLayout';

import RequireAuth from '../utils/RequireAuth';

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
import PaymentPage from '../pages/tr/PaymentPage';
import RegistrationPage from '../pages/tr/RegistrationPage';
import UserInfoPage from '../pages/tr/userInfoPage';
import MailQueryPage from '../pages/tr/MailQueryPage';
import ViewOrders from '../pages/tr/ViewOrders';
import OrdersPageUser from '../pages/tr/OrdersPage';

// EN pages
import HomeEN from '../pages/en/Home';
import ProductsEN from '../pages/en/ProductsEn';
import ProductDetailEN from '../pages/en/ProductDetail';
import CartPageEN from '../pages/en/CartPage';
import LoginEN from '../pages/en/LoginPage';
import RegisterEN from '../pages/en/RegisterPage';
import NotFoundEn from '../pages/en/NotFound';
import ProfileEN from '../pages/en/Profile';
import GuestInfoEN from '../pages/en/guestInfoPage';
import PaymentPageEN from '../pages/en/PaymentPage';
import RegistrationPageEN from '../pages/en/RegistrationPage';
import UserInfoPageEN from '../pages/en/userInfoPage';
import MailQueryPageEN from '../pages/en/MailQueryPage';
import ViewOrdersEN from '../pages/en/ViewOrders';
import OrdersPageUserEn from '../pages/en/OrdersPage';

export default function AppRouter() {
  const language = useLocation().pathname.split('/')[1];

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

        {/* Korunan sayfa */}
        <Route
          path="account"
          element={
            <RequireAuth lang="tr">
              <ProfileTR />
            </RequireAuth>
          }
        />

        <Route path="guestInfo" element={<GuestInfo />} />
        <Route path="pay" element={<PaymentPage />} />
        <Route path="register/afterPay" element={<RegistrationPage />} />
        <Route path="userInfo" element={<UserInfoPage />} />
        <Route path="mailQuery" element={<MailQueryPage />} />
        <Route path="view-orders" element={<ViewOrders />} />
        <Route path="ordersPage" element={<OrdersPageUser />} />

        <Route path="404" element={<NotFoundTr />} />
      </Route>
      {/* TR Routes Finished*/}


      {/* EN Routes */}
      <Route path="/en" element={<Layout />}>
        <Route index element={<HomeEN />} />
        <Route path=":category" element={<ProductsEN />} />
        <Route path=":category/:id" element={<ProductDetailEN />} />
        <Route path="cart" element={<CartPageEN />} />
        <Route path="login" element={<LoginEN />} />
        <Route path="register" element={<RegisterEN />} />

        {/* Korunan sayfa */}
        <Route
          path="account"
          element={
            <RequireAuth lang="en">
              <ProfileEN />
            </RequireAuth>
          }
        />

        <Route path="guestInfo" element={<GuestInfoEN />} />
        <Route path="pay" element={<PaymentPageEN />} />
        <Route path="register/afterPay" element={<RegistrationPageEN />} />
        <Route path="userInfo" element={<UserInfoPageEN />} />
        <Route path="mailQuery" element={<MailQueryPageEN />} />
        <Route path="view-orders" element={<ViewOrdersEN />} />
        <Route path="ordersPage" element={<OrdersPageUserEn />} />

        <Route path="404" element={<NotFoundEn />} />
      </Route>


      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="products" index element={<Products />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={`/${language || 'tr'}/404`} replace />}
      />
    </Routes>
  );
}
