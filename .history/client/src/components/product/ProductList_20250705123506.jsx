import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import ProductCard from './ProductCard';

const ProductList = ({ products = [], lang = 'en' }) => {
  if (!products || products.length === 0) {
    return <Alert variant="info">Ürün bulunamadı.</Alert>;
  }
console.log("list page",categor_key);
  return (
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {products.map((product, index) => (
        <Col key={product._id || index}>
          <ProductCard product={product} lang={lang} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;
