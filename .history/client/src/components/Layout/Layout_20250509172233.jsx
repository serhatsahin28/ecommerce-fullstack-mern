import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Container } from 'react-bootstrap';
import HomeBody from '../HomeBody';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Ana sayfa kontrolü (örn: "/tr" veya "/en")
  const isHomePage = location.pathname === '/' || location.pathname === '/tr' || location.pathname === '/en';

  return (
    <>
      <Header />
      <Container fluid className="flex-grow-1">{children}</Container>
      
      {/* Ana sayfa (Home) için HomeBody render edilsin */}
      {isHomePage && <HomeBody />}

      <Footer />
    </>
  );
};

export default Layout;
