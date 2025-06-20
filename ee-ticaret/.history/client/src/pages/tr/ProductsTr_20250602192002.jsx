import React, { useState, useEffect, useMemo, Suspense, useContext } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert, Card, Toast, ToastContainer } from 'react-bootstrap';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaListUl, FaExclamationCircle, FaShoppingCart } from 'react-icons/fa';
import { CartContext } from '../../components/common/CartContext';

const ProductList = React.lazy(() => import('../../components/product/ProductList'));

const normalizeSlug = (slug) =>
  slug?.toLowerCase()
    .replace(/&/g, 've')
    .replace(/[\s_-]+/g, '_')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const categorySlugToKey = {
  'elektronik': 'electronics',
  'moda': 'fashion',
  'kitaplar': 'books',
  'spor': 'sports',
  'ev_ofis': 'home_office',
};

const categoryNames = {
  electronics: 'Elektronik',
  fashion: 'Moda',
  books: 'Kitaplar',
  sports: 'Spor',
  home_office: 'Ev & Ofis'
};

export default function ProductsTr() {
  const { category: rawSlug } = useParams();
  const normalizedSlug = normalizeSlug(rawSlug);
  const categoryKey = categorySlugToKey[normalizedSlug];

  const { t, i18n } = useTranslation(['products']);
  const currentLang = i18n.language || 'tr';
  const { addToCart } = useContext(CartContext);

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const items = t('items', { returnObjects: true, lng: currentLang });
      setAllProducts(Array.isArray(items) ? items : []);
      setIsLoading(false);
    }, 200);
  }, [t, currentLang]);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 50);
  }, [categoryKey]);

  if (!categoryKey) {
    return <Navigate to="/tr/404" replace />;
  }

  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage(`${product.name} sepete eklendi!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

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

  if (rawSlug && !categoryKey) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning" className="shadow-sm">
          <FaExclamationCircle className="me-2" /> Geçersiz kategori: <strong>{rawSlug}</strong>
        </Alert>
      </Container>
    );
  }

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
            {categoryKey ? `${categoryNames[categoryKey]} Ürünler` : t('page_title')}
          </h1>
          <p className="text-muted">{t('page_subtitle')}</p>
        </header>

        <Form className="mb-4" onSubmit={e => e.preventDefault()}>
          <InputGroup>
            <Form.Control
              type="search"
              placeholder="Ürünlerde ara..."
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
              <option value="default">Varsayılan</option>
              <option value="price_asc">Fiyat (Artan)</option>
              <option value="price_desc">Fiyat (Azalan)</option>
              <option value="name_asc">İsim (A-Z)</option>
              <option value="name_desc">İsim (Z-A)</option>
              <option value="rating_desc">En Yüksek Puan</option>
            </Form.Select>
          </InputGroup>
        </Form>

        <Suspense fallback={<Spinner animation="border" variant="primary" />}>
          {filteredProducts.length > 0 ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {filteredProducts.map(product => (
                <Col key={product.id}>
                  <Card className="h-100 shadow-sm d-flex flex-column">
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.name}
                      style={{ objectFit: 'cover', height: 180 }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>
                        <Link to={`/tr/products/${product.id}`} className="text-decoration-none text-dark">
                          {product.name}
                        </Link>
                      </Card.Title>

                      <Card.Text>{product.description}</Card.Text>

                      <div className="mt-auto">
                        <div className="fw-bold text-danger mb-2">{product.price} ₺</div>
                        <Button variant="danger" size="sm" onClick={() => handleAddToCart(product)}>
                          <FaShoppingCart className="me-2" /> Sepete Ekle
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
                <Card.Title>Ürün bulunamadı</Card.Title>
                <Card.Text>Arama kriterlerinize uyan ürün yok.</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Suspense>
      </Container>

    <div className="bg-light min-vh-100 position-relative">
  {/* Navbar altında toast için alan */}
  <div style={{ position: 'relative' }}>
    <ToastContainer
      className="p-3"
      style={{
        position: 'absolute',
        top: 0,
        right: '1rem',
        zIndex: 1055
      }}
    >
      <Toast show={showToast} onClose={() => setShowToast(false)} bg="success">
        <Toast.Header closeButton={false}>
          <strong className="me-auto">✔</strong>
        </Toast.Header>
        <Toast.Body className="text-white small">
          ✅ {toastMessage || (i18n.language === 'tr' ? 'Ürün sepete eklendi!' : 'Product added to cart!')}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  </div>

    </div>
  );
}
