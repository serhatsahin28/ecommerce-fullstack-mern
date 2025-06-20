import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Form, Button, InputGroup, Spinner, Card, Row, Col } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import productsData from '../../data/products.json'; // ← JSON'u doğrudan import et

export default function Products() {
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // Simüle "loading" (gerçek api yoksa)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts(productsData.items);
      setLoading(false);
    }, 300); // kısa bir bekleme efekti
  }, []);

  // Kategori ve arama filtreleme
  const filteredProducts = useMemo(() => {
    let result = products;
    if (category) {
      result = result.filter(p => p.category_key === category);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }
    return result;
  }, [products, category, searchQuery]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="danger" />
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5">
        <h1 className="display-5 fw-bold text-danger text-center mb-4">
          {category ? category.toUpperCase() : "Tüm Ürünler"}
        </h1>
        <Form className="mb-4" onSubmit={e => e.preventDefault()}>
          <InputGroup>
            <Form.Control
              type="search"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-danger"><FaSearch /></Button>
          </InputGroup>
        </Form>
        {filteredProducts.length > 0 ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredProducts.map(product => (
              <Col key={product.id}>
                <Card className="h-100">
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
          <Card className="p-5 text-center">
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
