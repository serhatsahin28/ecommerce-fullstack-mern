import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import ProductCard from './ProductCard';
import { useEffect,useState } from 'react';
import { useTranslation } from 'react-i18next';
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:5000/products') // API endpoint
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Veri alınırken hata oluştu:', err));
  }, []);


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