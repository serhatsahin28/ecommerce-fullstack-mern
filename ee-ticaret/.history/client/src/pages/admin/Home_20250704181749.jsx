// src/pages/admin/Home.jsx
import React from 'react';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { FaBox, FaShoppingCart, FaUsers, FaDollarSign, FaStar } from 'react-icons/fa';

const adminHome = () => {
  // Dashboard istatistikleri
  const stats = [
    { title: 'Toplam Ürün', count: 128, icon: <FaBox size={32} className="text-primary" /> },
    { title: 'Toplam Sipariş', count: 245, icon: <FaShoppingCart size={32} className="text-success" /> },
    { title: 'Toplam Kullanıcı', count: 87, icon: <FaUsers size={32} className="text-warning" /> },
    { title: 'Toplam Gelir', count: '₺12.450', icon: <FaDollarSign size={32} className="text-danger" /> },
  ];

  // Örnek ürün listesi (bunlar API'den gelecek)
  const products = [
    {
      _id: '684cc068d420cd4245fb1800',
      image: '/images/laptop.jpg',
      price: 799,
      rating: 4.7,
      translations: {
        tr: { name: 'Akıllı Telefon A' },
        en: { name: 'Smartphone A' }
      }
    },
    {
      _id: '684cc068d420cd4245fb1801',
      image: '/images/book1.jpg',
      price: 120,
      rating: 4.8,
      translations: {
        tr: { name: 'Yenilikçi Yazarlık' },
        en: { name: 'Innovative Writing' }
      }
    },
    {
      _id: '684cc068d420cd4245fb1802',
      image: '/images/fashion1.jpg',
      price: 350,
      rating: 4.5,
      translations: {
        tr: { name: 'Şık Elbise' },
        en: { name: 'Elegant Dress' }
      }
    },
  ];

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold text-danger">Admin Dashboard</h2>
      <Row className="g-4 mb-5">
        {stats.map((stat, idx) => (
          <Col key={idx} xs={12} sm={6} md={3}>
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

      <h3 className="mb-4">Ürünler</h3>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.map(product => (
          <Col key={product._id}>
            <Card className="h-100 shadow-sm">
              <Card.Img variant="top" src={product.image} style={{ height: '180px', objectFit: 'cover' }} />
              <Card.Body className="d-flex flex-column">
                <Card.Title style={{ fontSize: '1rem', minHeight: '2.5rem' }}>
                  {product.translations.tr.name}
                </Card.Title>
                <Card.Text className="mb-1 fw-bold">₺{product.price.toFixed(2)}</Card.Text>
                <Card.Text>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} color={i < Math.round(product.rating) ? '#ffc107' : '#e4e5e9'} />
                  ))}
                  <span className="ms-2 text-muted">({product.rating.toFixed(1)})</span>
                </Card.Text>
                <div className="mt-auto d-flex justify-content-between">
                  <Button size="sm" variant="outline-primary">Düzenle</Button>
                  <Button size="sm" variant="outline-danger">Sil</Button>
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
