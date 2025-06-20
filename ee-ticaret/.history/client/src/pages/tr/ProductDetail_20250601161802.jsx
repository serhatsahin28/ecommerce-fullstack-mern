import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaCartPlus } from 'react-icons/fa';

const ProductDetailTR = () => {
  const { id } = useParams();
  const { t } = useTranslation(['products']);
  const items = t('items', { returnObjects: true }) || [];
  const product = items.find(item => item.id === id);

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h2>Ürün bulunamadı</h2>
        <p>Aradığınız ürün mevcut değil.</p>
      </Container>
    );
  }

  const formattedPrice = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(product.price);

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <Image src={product.image} fluid rounded className="shadow-sm" />
        </Col>
        <Col md={6}>
          <h1 className="fw-bold mb-3">{product.name}</h1>
          <h4 className="text-danger mb-3">{formattedPrice}</h4>
          {product.tags && product.tags.map(tag => (
            <Badge bg="warning" key={tag} className="me-2 text-dark">{tag}</Badge>
          ))}
          <p className="mt-4 text-muted">{product.description}</p>
          <Button variant="danger" size="lg" className="mt-3">
            <FaCartPlus className="me-2" /> {t('add_to_cart')}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailTR;
