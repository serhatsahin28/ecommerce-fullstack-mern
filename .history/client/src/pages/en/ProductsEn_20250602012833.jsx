import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert, Card } from 'react-bootstrap';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaListUl, FaExclamationCircle } from 'react-icons/fa';

// Lazy load ProductList (assuming it's a shared component or you'll have an English version if needed)
const ProductList = React.lazy(() => import('../../components/product/ProductList')); // Path might need adjustment

// Helper function to normalize slug
const normalizeSlug = (slug) =>
  slug?.toLowerCase()
    .replace(/&/g, 'and') // Changed 've' to 'and'
    .replace(/[\s_-]+/g, '_')
    .normalize('NFD') // Decompose characters
    .replace(/[\u0300-\u036f]/g, ''); // Remove decomposed accents

// Mapping from URL slug to category_key (primarily English slugs)
const categorySlugToKey = {
  'electronics': 'electronics',
  'fashion': 'fashion',
  'books': 'books',
  'sports': 'sports',
  'home_office': 'home_office',
  // You might keep Turkish ones if you want to support old/mixed URLs,
  // but for a strictly English page, they could be removed.
  'elektronik': 'electronics',
  'moda': 'fashion',
  'kitaplar': 'books',
  'spor': 'sports',
  'ev_ofis': 'home_office',
};

// Display names for categories
const categoryNames = {
  electronics: 'Electronics',
  fashion: 'Fashion',
  books: 'Books',
  sports: 'Sports',
  home_office: 'Home & Office'
};
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);

export default function ProductsEn() {
  const { category: rawSlug } = useParams();
  const normalizedSlug = normalizeSlug(rawSlug);
  const categoryKey = categorySlugToKey[normalizedSlug];

  const { t, i18n } = useTranslation(['products']); // Assumes 'products.json' namespace
  const currentLang = i18n.language || 'en'; // Default to 'en' if not set

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call or data loading
    setTimeout(() => {
      // Ensure 'items' key exists in your English translation file (e.g., public/locales/en/products.json)
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
      case 'rating_desc': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break; // Assuming products might have a rating
      default: break;
    }

    return result;
  }, [allProducts, categoryKey, searchQuery, sortBy]);

  // Show warning for invalid category slug
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
        <Spinner animation="border" variant="primary" /> {/* Changed variant for visual distinction if needed */}
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5">
        <header className="text-center mb-4">
          <h1 className="display-5 fw-bold text-primary"> {/* Changed text color for visual distinction */}
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
            <Button variant="outline-primary"><FaSearch /></Button> {/* Changed variant */}
            <Form.Select
              className="ms-2"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ maxWidth: 200 }}
            >
              <option value="default">Default</option>
              <option value="price_asc">Price (Ascending)</option>
              <option value="price_desc">Price (Descending)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="rating_desc">Highest Rating</option>
            </Form.Select>
          </InputGroup>
        </Form>

        <Suspense fallback={<Spinner animation="border" variant="primary" />}>
          {filteredProducts.length > 0 ? (
            // If ProductList component is used, it would be:
            // <ProductList products={filteredProducts} />
            // For now, I'm keeping the direct mapping as in ProductsTr
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {filteredProducts.map(product => (
                <Col key={product.id}>
                  <Card className="h-100 shadow-sm">
                    <Card.Img
                      variant="top"
                      src={product.image} // Assuming image paths are universal
                      alt={product.name}
                      style={{ objectFit: 'cover', height: 180 }}
                    />
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Text>{product.description}</Card.Text>
                      {/* Assuming price is just a number; currency symbol can be part of the price string from JSON or formatted */}
                      <div className="fw-bold text-primary">${product.price}</div> {/* Changed currency symbol and color */}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card className="text-center p-5">
              <Card.Body>
                <FaListUl size={40} className="mb-3 text-primary opacity-50" /> {/* Changed color */}
                <Card.Title>No products found</Card.Title>
                <Card.Text>No products match your search criteria.</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Suspense>
      </Container>
    </div>
  );
}