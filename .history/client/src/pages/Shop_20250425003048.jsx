import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, ButtonGroup, Button } from 'react-bootstrap';
import ProductList from '../components/product/ProductList';

const Shop = () => {
  const { t } = useTranslation('shop');
  const [category, setCategory] = useState('all');

  // Örnek veri; gerçek projede API’den çekeceksin
  const allProducts = [
    /* { id, name, category, price, image, … } */
  ];

  const filtered = category === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === category);

  return (
    <Container className="py-5">
      <h1>{t('title')}</h1>
      <p className="text-muted mb-4">{t('subtitle')}</p>

      {/* Kategori filtre düğmeleri */}
      <ButtonGroup className="mb-4">
        {Object.keys(t('filter', { returnObjects: true })).map(key => (
          <Button
            key={key}
            variant={category === key ? 'primary' : 'outline-secondary'}
            onClick={() => setCategory(key)}
          >
            {t(`filter.${key}`)}
          </Button>
        ))}
      </ButtonGroup>

      {/* Ürün listesi */}
      <Row>
        <ProductList products={filtered} />
      </Row>
    </Container>
  );
};

export default Shop;
