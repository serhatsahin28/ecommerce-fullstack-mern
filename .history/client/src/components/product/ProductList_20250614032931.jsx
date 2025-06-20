import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import ProductCard from './ProductCard';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';


const ProductList = ({ products }) => {
  const { t } = useTranslation('products');

  if (!products || products.length === 0) {
    return <Alert variant="info">{t('no_products_found')}</Alert>;
  }

  return (
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {products.map(product => (
        <Col key={product.id}>
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;