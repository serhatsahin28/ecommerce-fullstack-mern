import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <FaExclamationTriangle size={60} className="text-danger mb-4" />
      <h1 className="fw-bold text-danger">404</h1>
      <h4 className="text-muted mb-3">Üzgünüz, aradığınız sayfa bulunamadı.</h4>
      <Button as={Link} to="/" variant="danger">
        Ana Sayfaya Dön
      </Button>
    </Container>
  );
};

export default NotFound;
