import React, { useState, useEffect, useMemo, Suspense, useContext } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Form, Button, InputGroup, Spinner,
  Alert, Card, Toast, ToastContainer
} from 'react-bootstrap';
import {
  FaSearch, FaListUl, FaExclamationCircle, FaShoppingCart
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../components/common/CartContext';

const normalizeSlug = (slug) =>
  slug?.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[\s_-]+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const categorySlugToKey = {
  'electronics': 'electronics',
  'fashion': 'fashion',
  'books': 'books',
  'sports': 'sports',
  'home_office': 'home_office',
  'elektronik': 'electronics',
  'moda': 'fashion',
  'kitaplar': 'books',
  'spor': 'sports',
  'ev_ofis': 'home_office',
};

const categoryNames = {
  electronics: 'Electronics',
  fashion: 'Fashion',
  books: 'Books',
  sports: 'Sports',
  home_office: 'Home & Office'
};

export default function ProductsEn() {
const { category } = useParams();
const { i18n } = useTranslation();
const lang = i18n.language;

if (!validCategories.includes(category)) {
  return <Navigate to={`/${lang}/404`} replace />;
} normalizedSlug = normalizeSlug(rawSlug);
  const categoryKey = categorySlugToKey[normalizedSlug];

  const currentLang = i18n.language || 'en';
  const { addToCart } = useContext(CartContext);

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => {
        const translated = data.map(item => {
          const t = item.translations?.[currentLang] || {};
          return {
            ...item,
            name: t.name || item.name,
            description: t.description || item.description,
            features: t.features || [],
            reviews: t.reviews || [],
          };
        });
        setAllProducts(translated);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Veri alınırken hata oluştu:', err);
        setIsLoading(false);
      });
  }, [currentLang]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [categoryKey]);

  if (!categoryKey) {
    return <Navigate to="/en/404" replace />;
  }

  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    result = result.filter(p => p.category_key === categoryKey);

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

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5">
        <header className="text-center mb-4">
          <h1 className="display-5 fw-bold text-primary">
            {categoryKey ? `${categoryNames[categoryKey]} Products` : 'Products'}
          </h1>
          <p className="text-muted">Explore top-rated items in this category</p>
        </header>

        <Form className="mb-4" onSubmit={e => e.preventDefault()}>
          <InputGroup>
            <Form.Control
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-primary"><FaSearch /></Button>
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

        {filteredProducts.length > 0 ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredProducts.map(product => (
              <Col key={product._id}>
                <Card className="h-100 shadow-sm d-flex flex-column">
                  <Card.Img
                    variant="top"
                    src={product.image}
                    alt={product.name}
                    style={{ objectFit: 'cover', height: 180 }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>
                      <Link to={`/en/${product.category_key}/${product._id}`} className="text-decoration-none text-dark">
                        {product.name}
                      </Link>
                    </Card.Title>

                    <Card.Text>{product.description}</Card.Text>

                    <ul className="small text-muted mb-3">
                      {product.features?.slice(0, 2).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      <div className="fw-bold text-primary mb-2">${product.price}</div>
                      <Button variant="danger" size="sm" onClick={() => handleAddToCart(product)}>
                        <FaShoppingCart className="me-2" /> Add to Cart
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card className="text-center p-5">
            <Card.Body>
              <FaListUl size={40} className="mb-3 text-primary opacity-50" />
              <Card.Title>No products found</Card.Title>
              <Card.Text>No products match your search criteria.</Card.Text>
            </Card.Body>
          </Card>
        )}
      </Container>

      <ToastContainer
        position="top-end"
        className="p-3 position-fixed"
        style={{ top: '70px', right: '1rem', zIndex: 1055 }}
      >
        <Toast show={showToast} onClose={() => setShowToast(false)} bg="success">
          <Toast.Header closeButton={false}>
            <strong className="me-auto">✔</strong>
          </Toast.Header>
          <Toast.Body className="text-white small">
            ✅ {toastMessage || 'Product added to cart!'}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
