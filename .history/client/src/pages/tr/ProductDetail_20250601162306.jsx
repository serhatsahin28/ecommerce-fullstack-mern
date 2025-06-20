// src/pages/ProductDetail.jsx
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Row, Col, Image, Badge, Button, Card } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart } from 'react-icons/fa';
import productsData from '../data/products.json'; // Yolu ihtiyaca göre ayarla

const getRatingStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={i} className="text-warning" />);
  if (halfStar) stars.push(<FaStarHalfAlt key="half" className="text-warning" />);
  for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={i + fullStars + 1} className="text-warning" />);

  return stars;
};

export default function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const lang = location.pathname.includes('/en') ? 'en' : 'tr';

  const product = productsData.items.find(item => item.id === id);

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h2>Product not found</h2>
        <p>The requested product could not be found.</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="align-items-center">
        <Col md={6}>
          <Image src={product.image} fluid rounded className="shadow-sm" />
        </Col>
        <Col md={6}>
          <h2 className="fw-bold mb-3">{product.name}</h2>
          <div className="mb-2">
            {getRatingStars(product.rating || 0)}{" "}
            <small className="text-muted ms-2">({product.rating || '0.0'})</small>
          </div>
          <p className="lead text-muted">{product.description}</p>
          <h3 className="text-danger fw-bold my-4">
            {lang === 'tr' ? `${product.price}₺` : `$${product.price}`}
          </h3>
          <Button variant="danger" size="lg" className="w-100">
            <FaShoppingCart className="me-2" />
            {lang === 'tr' ? 'Sepete Ekle' : 'Add to Cart'}
          </Button>
        </Col>
      </Row>

      {product.features && product.features.length > 0 && (
        <section className="mt-5">
          <h4 className="mb-3">Features</h4>
          <ul className="list-unstyled">
            {product.features.map((f, i) => (
              <li key={i} className="mb-2">
                <Badge bg="light" text="dark" className="me-2">✔</Badge> {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-5">
          <h4 className="mb-3">Customer Reviews</h4>
          {product.reviews.map((r, i) => (
            <Card key={i} className="mb-3">
              <Card.Body>
                <Card.Text>"{r}"</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </section>
      )}
    </Container>
  );
}
