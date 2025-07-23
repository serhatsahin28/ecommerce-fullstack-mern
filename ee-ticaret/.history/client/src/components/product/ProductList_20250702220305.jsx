import React, { useEffect, useState } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import ProductCard from './ProductCard';
import { useTranslation } from 'react-i18next';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => {
        const translated = data.map((item) => {
          const t = item.translations?.[currentLang] || {};
          return {
            ...item,
            name: t.name || item.name,
            description: t.description || item.description,
            features: t.features || [],
            reviews: t.reviews || [],
          };
        });
        setProducts(translated);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Veri alınırken hata oluştu:', err);
        setIsLoading(false);
      });
  }, [currentLang]);


console.log("productsproductsproducts:",products);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <Alert variant="info">No products found.</Alert>;
  }

  return (
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {products.map((product, index) => (
        <Col key={product._id || index}>
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;
