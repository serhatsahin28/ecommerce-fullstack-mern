// src/components/Layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = () => {
  return (
    <>
      <Header />

      {/* Toast mesajları Header'ın hemen altında, sağ üstte gösterilecek */}
      <ToastContainer
        position="top-end"
        className="mt-2 me-2"
        style={{ zIndex: 1056 }}
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Ana içerik alanı */}
      <Container fluid className="flex-grow-1 py-4" style={{ minHeight: '70vh' }}>
        <Outlet />
      </Container>

      <Footer />
    </>
  );
};

export default Layout;
