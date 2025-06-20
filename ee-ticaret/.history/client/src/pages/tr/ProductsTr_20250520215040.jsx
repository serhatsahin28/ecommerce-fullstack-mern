import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert, Card } from 'react-bootstrap';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaListUl, FaExclamationCircle } from 'react-icons/fa';

// Bileşeni lazy yükleme (varsa)
const ProductList = React.lazy(() => import('../../components/product/ProductList'));

// Kategori başlıkları eşleşmesi (isteğe göre genişletilebilir)
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

  // i18n üzerinden ürün verisini al
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const items = t('items', { returnObjects: true, lng: currentLang });
      setAllProducts(Array.isArray(items) ? items : []);
      setIsLoading(false);
    }, 200); // küçük gecikme kullanıcı deneyimi için
  }, [t, currentLang]);

  // Filtreleme ve sıralama işlemi
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Kategoriye göre filtrele
    if (category) {
      result = result.filter(p => p.category_key === category);
    }

    // Arama filtresi
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
      case 'rating_desc': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }

    return result;
  }, [allProducts, category, searchQuery, sortBy]);

  // Hatalı kategori kontrolü
  if (category && !categoryNames[category]) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning" className="shadow-sm">
          <FaExclamationCircle className="me-2" /> Geçersiz kategori: <strong>{category}</strong>
        </Alert>
      </Container>
    );
  }

  // Yükleniyor
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
            {category ? `${categoryNames[category]} Ürünleri` : t('page_title')}
          </h1>
          <p className="text-muted">{t('page_subtitle')}</p>
        </header>

        {/* Arama ve sıralama */}
        <Form className="mb-4" onSubmit={e => e.preventDefault()}>
          <InputGroup>
            <Form.Control
              type="search"
              placeholder="Ürün ara..."
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
              <option value="default">Varsayılan</option>
              <option value="price_asc">Fiyat (Artan)</option>
              <option value="price_desc">Fiyat (Azalan)</option>
              <option value="name_asc">İsim (A-Z)</option>
              <option value="name_desc">İsim (Z-A)</option>
              <option value="rating_desc">En Yüksek Puan</option>
            </Form.Select>
          </InputGroup>
        </Form>

        {/* Ürün listesi */}
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
                <Card.Title>Ürün bulunamadı</Card.Title>
                <Card.Text>Aradığınız kritere uygun ürün bulunamadı.</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Suspense>
      </Container>
    </div>
  );
}
