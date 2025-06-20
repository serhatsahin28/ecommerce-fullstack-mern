// src/components/Layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // <--- Outlet'i import edin
import Header from './Header';
import Footer from './Footer';
import { Container } from 'react-bootstrap';
import HomeBody from '../HomeBody'; // Bunun burada olması gerekiyorsa kalsın, değilse kaldırın

const Layout = () => { // children prop'unu kaldırın
  return (
    <>
      <Header />
      <Container fluid className="flex-grow-1">
        <Outlet /> {/* <--- children yerine Outlet kullanın */}
      {/* HomeBody'nin her sayfada görünmesi isteniyorsa burada kalabilir.
          Sadece ana sayfada görünmesi gerekiyorsa, HomeTR/HomeEN bileşenlerinin içine taşınmalı. */}
      <HomeBody />
      <Footer />
    </>
  );
};

export default Layout;