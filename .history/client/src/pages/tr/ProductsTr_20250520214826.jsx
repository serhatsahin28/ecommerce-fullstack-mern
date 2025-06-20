import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert, Card } from 'react-bootstrap';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaListUl, FaExclamationCircle } from 'react-icons/fa';

const ProductList = React.lazy(() => import('../../components/product/ProductList')); // varsa kullanılır

// Türkçe kategori isimleri eşleşmesi
const categoryNames = {
  electronics: 'Elektronik',
  fashion: 'Moda',
  books: 'Kitaplar',
  sports: 'Spor',
  home_office: 'Ev & Ofis'
};

export default function ProductsTr() {
  const { category } = useParams();
  const { t, i18n } = useTranslation(['products']);
  const currentLang = i18n.language || 'tr';

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  // i18n'den veri al
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const items = t('items', { returnObjects: true, lng: currentLang });
      setAllProducts(Array.isArray(items) ? items : []);
      setIsLoading(false);
    }, 300);
  }, [t, currentLang]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (category) {
      products = products.filter(p => p.category_key === category);
    }

    const query = searchQuery.toLowerCase();
    if (query) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'price_asc': products.sort((a, b) => a.price - b.price); break;
      case 'price_desc': products.sort((a, b) => b.price - a.price); break;
      case 'name_asc': products.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': products.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'rating_desc': products.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }

    return products;
  }, [allProducts, category, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="danger" />
      </Container>
    );
  }

  if (category && !Object.keys(categoryNames).includes(category)) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning" className="shadow-sm">
          <FaExclamationCircle className="me-2" /> <strong>"{category}"</strong> kategorisi bulunamadı.
        </Alert>
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5">
        <header className="text-center mb-4">
          <h1 className="display-5 fw-bold text-danger">
            {category ? `${categoryNames[category]} Ürünleri` : t('page_title')}
          </h1>
          <p className="text-muted">{t('page_subtitle')}</p>
        </header>

        <Form className="mb-4" onSubmit={e => e.preventDefault()}>
          <InputGroup>
            <Form.Control
              type="search"
              placeholder={t('filters_sort.search_placeholder')}
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
              <option value="default">{t('filters_sort.sort_options.default')}</option>
              <option value="price_asc">{t('filters_sort.sort_options.price_asc')}</option>
              <option value="price_desc">{t('filters_sort.sort_options.price_desc')}</option>
              <option value="name_asc">{t('filters_sort.sort_options.name_asc')}</option>
              <option value="name_desc">{t('filters_sort.sort_options.name_desc')}</option>
              <option value="rating_desc">{t('filters_sort.sort_options.rating_desc')}</option>
            </Form.Select>
          </InputGroup>
        </Form>

        <Suspense fallback={<Spinner animation="border" variant="danger" />}>
          {filteredProducts.length > 0 ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {filteredProducts.map(product => (
                <Col key={product.id}>
                  <Card className="h-100 shadow-sm">
                    <Card.Img variant="top" src={product.image} style={{ objectFit: 'cover', height: 180 }} />
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Text>{product.description}</Card.Text>
                      <div className="fw-bold text-danger">{product.price} ₺</div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card className="text-center p-5">
              <Card.Body>
                <FaListUl size={40} className="mb-3 text-danger opacity-50" />
                <Card.Title>{t('feedback_messages.no_results.title')}</Card.Title>
                <Card.Text>{t('feedback_messages.no_results.message')}</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Suspense>
      </Container>
    </div>
  );
}
