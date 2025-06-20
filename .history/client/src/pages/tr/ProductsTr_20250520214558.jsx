import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert, Card } from 'react-bootstrap';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaListUl, FaExclamationCircle } from 'react-icons/fa';
import productsData from '../../data/products.json';

const ProductList = React.lazy(() => import('../../components/product/ProductList')); // eğer kullanıyorsan

// Kategori başlığı eşleşmeleri (görünen isimler)
const categoryNames = {
  electronics: 'Elektronik',
  fashion: 'Moda',
  books: 'Kitaplar',
  sports: 'Spor',
  home_office: 'Ev & Ofis'
};

export default function ProductsTr() {
  const { category } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  // JSON verisini yükle (simülasyonlu bekleme ile)
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setAllProducts(productsData.items || []);
      setIsLoading(false);
    }, 300);
  }, []);

  // Filtreleme
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (category) {
      filtered = filtered.filter(p => p.category_key === category);
    }

    const query = searchQuery.toLowerCase();
    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sıralama
    switch (sortBy) {
      case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'name_asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'rating_desc': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }

    return filtered;
  }, [allProducts, category, searchQuery, sortBy]);

  // Yükleniyor
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="danger" />
      </Container>
    );
  }

  // Hatalı kategori
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
      <Container fluid="lg" className="py-5">
        {/* Başlık */}
        <header className="text-center mb-4">
          <h1 className="display-5 fw-bold text-danger">
            {category ? `${categoryNames[category]} Ürünleri` : 'Tüm Ürünler'}
          </h1>
          <p className="text-muted">Ürünleri listeleyin, arayın, sıralayın.</p>
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

        {/* Ürün Listesi */}
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
                <Card.Title>Ürün bulunamadı</Card.Title>
                <Card.Text>Aramanıza veya kategoriye uygun ürün yok.</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Suspense>
      </Container>
    </div>
  );
}
