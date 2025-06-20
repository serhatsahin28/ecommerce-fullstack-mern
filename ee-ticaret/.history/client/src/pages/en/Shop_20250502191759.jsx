import React, { useState } from 'react';
import { Container, ButtonGroup, Button, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Dummy veri örneği
const allProducts = [
  {
    id: 1,
    title: 'Wireless Headphones',
    category: 'electronics',
    price: '120',
    image: 'https://via.placeholder.com/300x200?text=Headphones'
  },
  {
    id: 2,
    title: 'Running Shoes',
    category: 'fashion',
    price: '90',
    image: 'https://via.placeholder.com/300x200?text=Shoes'
  },
  {
    id: 3,
    title: 'Smart Watch',
    category: 'electronics',
    price: '250',
    image: 'https://via.placeholder.com/300x200?text=Watch'
  },
  {
    id: 4,
    title: 'Backpack',
    category: 'fashion',
    price: '40',
    image: 'https://via.placeholder.com/300x200?text=Backpack'
  }
];

export default function Shop() {
  const { t } = useTranslation('shop');
  const [category, setCategory] = useState('all');

  const categories = ['all', 'electronics', 'fashion'];

  const filteredProducts =
    category === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category === category);

  return (
    <Container className="py-5">
      <h2 className="mb-4">{t('title')}</h2>

      <ButtonGroup className="mb-4">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? 'primary' : 'outline-secondary'}
            onClick={() => setCategory(cat)}
          >
            {t(`categories.${cat}`)}
          </Button>
        ))}
      </ButtonGroup>

      <Row>
        {filteredProducts.map((product) => (
          <Col md={4} key={product.id} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Img
                variant="top"
                src={product.image}
                alt={product.title}
                style={{ objectFit: 'cover', height: '200px' }}
              />
              <Card.Body>
                <Card.Title>{product.title}</Card.Title>
                <Card.Text>{t('price')}: ${product.price}</Card.Text>
              </Card.Body>
              <Card.Footer>
                <Button variant="success" className="w-100">
                  {t('addToCart')}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
