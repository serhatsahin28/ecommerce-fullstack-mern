import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Form, Button, InputGroup, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaListUl, FaExclamationCircle } from 'react-icons/fa';

export default function ProductTr() {
  const { category } = useParams();
  const { t, i18n } = useTranslation(['products']);
  const currentLang = i18n.language || 'tr';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kategori verisini al
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const items = t(`${category}.items`, { ns: 'products', returnObjects: true });
        if (!Array.isArray(items)) throw new Error('Veri uygun değil');
        setProducts(items);
      } catch (err) {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  }, [category, t]);

  const sortedAndFiltered = useMemo(() => {
    let result = [...products];

    // Arama
    const query = searchQuery.toLowerCase();
    if (query) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sıralama
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'name_asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
    }

    return result;
  }, [products, searchQuery, sortBy]);

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
        {/* Başlık */}
        <header className="text-center mb-4">
          <h1 className="display-5 fw-bold text-danger">
            {t(`${category}.title`, { ns: 'products' }) || category}
          </h1>
          <p className="text-muted">{t('page_subtitle')}</p>
        </header>

        {/* Arama ve sıralama */}
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
            </Form.Select>
          </InputGroup>
        </Form>

        {/* Ürünler */}
        {sortedAndFiltered.length > 0 ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {sortedAndFiltered.map(product => (
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
                    <div className="fw-bold text-danger">{product.price} ₺</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card className="text-center p-5 mt-4">
            <Card.Body>
              <FaListUl size={40} className="mb-3 text-danger opacity-50" />
              <Card.Title>{t('feedback_messages.no_results.title')}</Card.Title>
              <Card.Text>{t('feedback_messages.no_results.message')}</Card.Text>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
}
