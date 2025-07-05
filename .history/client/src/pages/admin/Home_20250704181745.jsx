// src/pages/admin/Home.jsx
import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { FaBox, FaShoppingCart, FaUsers, FaDollarSign } from 'react-icons/fa';

const adminHome = () => {
  // Bunlar örnek veriler, sonradan API ile değiştirilecek
  const stats = [
    {
      title: 'Toplam Ürün',
      count: 128,
      icon: <FaBox size={32} className="text-primary" />,
    },
    {
      title: 'Toplam Sipariş',
      count: 245,
      icon: <FaShoppingCart size={32} className="text-success" />,
    },
    {
      title: 'Toplam Kullanıcı',
      count: 87,
      icon: <FaUsers size={32} className="text-warning" />,
    },
    {
      title: 'Toplam Gelir',
      count: '₺12.450',
      icon: <FaDollarSign size={32} className="text-danger" />,
    },
  ];

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold text-danger">Admin Dashboard</h2>
      <Row className="g-4">
        {stats.map((stat, index) => (
          <Col key={index} xs={12} sm={6} md={3}>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex align-items-center">
                <div className="me-3">{stat.icon}</div>
                <div>
                  <h6 className="mb-1 text-muted">{stat.title}</h6>
                  <h4 className="mb-0 fw-semibold">{stat.count}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default adminHome;
