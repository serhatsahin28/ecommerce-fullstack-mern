import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import productsData from '../locales/products.json'; // JSON dosyanın yolu (seninkine göre ayarla)

export default function ProductTr() {
  const { category } = useParams(); // /tr, /tr/electronics gibi route
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    // JSON'dan veri alıp state'e atıyoruz
    setLoading(true);
    setTimeout(() => {
      setAllProducts(productsData.items || []);
      setLoading(false);
    }, 300);
  }, []);

  // Kategori ve arama ile filtreleme
  const filtered = useMemo(() => {
    let items = allProducts;
    if (category) {
      items = items.filter(item => item.category_key === category);
    }
    if (search.trim()) {
      const query = search.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    return items;
  }, [allProducts, category, search]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="danger" />
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5">
        <h1 className="display-5 fw-bold text-danger text-center mb-4">
          {category
            ? (category.charAt(0).toUpperCase() + category.slice(1)) + " Ürünleri"
            : "Tüm Ürünler"}
        </h1>
        {/* Arama kutusu */}
        <Form className="mb-4" onSubmit={e => e.preventDefault()}>
          <InputGroup>
            <Form.Control
              type="search"
              placeholder="Ürün ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Button variant="outline-danger"><FaSearch /></Button>
          </InputGroup>
        </Form>
        {filtered.length > 0 ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filtered.map(product => (
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
              <h4>Ürün bulunamadı</h4>
              <p>Aramanıza veya kategoriye uygun ürün yok.</p>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
}
