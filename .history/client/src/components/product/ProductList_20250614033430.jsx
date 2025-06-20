import React, { useEffect, useState } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import ProductCard from './ProductCard';
import { useTranslation } from 'react-i18next';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const { t, i18n } = useTranslation('products');

  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Veri alınırken hata oluştu:', err));
  }, []);

  if (!products || products.length === 0) {
    return <Alert variant="info">{t('no_products_found')}</Alert>a;
  }

  return (
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {products.map((product, index) => (
        <Col key={product._id || index}>
          <ProductCard
            product={{
              ...product,
              name: product.translations?.[i18n.language]?.name,
              description: product.translations?.[i18n.language]?.description
            }}
          />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;
