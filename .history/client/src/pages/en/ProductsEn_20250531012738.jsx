// src/pages/en/ProductsEn.jsx
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert, Card } from 'react-bootstrap';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaListUl, FaExclamationCircle } from 'react-icons/fa';

const ProductList = React.lazy(() => import('../../components/product/ProductList'));

// Helper to normalize slug
const normalizeSlug = (slug) =>
  slug?.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[\s_-]+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Map URL slug to category_key
const categorySlugToKey = {
  'electronics': 'electronics',
  'fashion': 'fashion',
  'books': 'books',
  'book': 'books',
  'sports': 'sports',
  'home_office': 'home_office',
  'home-office': 'home_office',
  'home_and_office': 'home_office',
  // fallback for some tr slugs
  'elektronik': 'electronics',
  'moda': 'fashion',
  'kitaplar': 'books',
  'kitap': 'books',
  'spor': 'sports',
  'ev_ofis': 'home_office',
  'ev-ve-ofis': 'home_office',
  'ev_ve_ofis': 'home_office'
};

const categoryNames = {
  electronics: 'Electronics',
  fashion: 'Fashion',
  books: 'Books',
  sports: 'Sports',
  home_office: 'Home & Office'
};

export default function ProductsEn() {
  const { category: rawSlug } = useParams();
  const normalizedSlug = normalizeSlug(rawSlug);
  const categoryKey = categorySlugToKey[normalizedSlug];

  const { t, i18n } = useTranslation(['products']);
  const currentLang = i18n.language || 'en';

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const items = t('items', { returnObjects: true, lng: currentLang });
      setAllProducts(Array.isArray(items) ? items : []);
      setIsLoading(false);
    }, 200);
  }, [t, currentLang]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (categoryKey) {
      result = result.filter(p => p.category_key === categoryKey);
    }

    const query = searchQuery.toLowerCase();
    if (query) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'name_asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'rating_desc': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }

    return result;
  }, [allProducts, categoryKey, searchQuery, sortBy]);

  // Show warning for invalid category
  if (rawSlug && !categoryKey) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning" className="shadow-sm">
          <FaExclamationCircle className="me-2" /> Invalid category: <strong>{rawSlug}</strong>
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="danger" />
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5">
        <header className="text-center mb-4">
          <h1 className="display-5 fw-bold text-danger">
            {categoryKey ? `${categoryNames[categoryKey]} Products` : t('page_title')}
          </h1>
          <p className="text-muted">{t('page_subtitle')}</p>
        </header>

        <Form className="mb-4" onSubmit={e => e.preventDefault()}>
          <InputGroup>
            <Form.Control
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-danger"><FaSearch /></Button>
            <Form.Select
              className="ms-2"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ maxWidth: 200 }}
            >
              <option value="default">Default</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="rating_desc">Highest Rating</option>
            </Form.Select>
          </InputGroup>
        </Form>

        <Suspense fallback={<Spinner animation="border" variant="danger" />}>
          {filteredProducts.length > 0 ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {filteredProducts.map(product => (
                <Col key={product.id}>
                  <Card className="h-100 shadow-sm">
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.name}
                      style={{ objectFit: 'cover', height: 180 }}
                    />
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Text>{product.description}</Card.Text>
                      <div className="fw-bold text-danger">${product.price}</div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card className="text-center p-5">
              <Card.Body>
                <FaListUl size={40} className="mb-3 text-danger opacity-50" />
                <Card.Title>No products found</Card.Title>
                <Card.Text>No products match your criteria.</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Suspense>
      </Container>
    </div>
  );
}
