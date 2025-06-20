import React from 'react';
import { Container } from 'react-bootstrap';
import Header from './Header';
import Footer from './Footer';
import HomeBody from '../HomeBody'; // Sayfa içeriğini buradan çekmek

// Layout bileşeni, tüm genel düzeni oluşturur
const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Header />
      
      {/* Sayfa içeriği, children prop'u ile gelecek */}
      <main className="content-container">
        <Container fluid className="flex-grow-1">
          {children}
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
