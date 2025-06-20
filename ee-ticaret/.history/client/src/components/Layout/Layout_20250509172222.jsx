import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Container } from 'react-bootstrap';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <Container fluid className="flex-grow-1">
        {children} {/* Burada gelen child component doğru şekilde render ediliyor */}
      </Container>
      <Footer />
    </>
  );
};

export default Layout;
