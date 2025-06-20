// src/components/Layout/Layout.jsx (örnek)
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header'; // Header'ınız burada olabilir
import Footer from '../Footer/Footer'; // Footer'ınız burada olabilir

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        {/* Bu Outlet çok önemli! */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;