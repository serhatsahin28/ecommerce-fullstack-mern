import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Form, Button, InputGroup, Spinner,
  Card, Toast, ToastContainer, Badge
} from 'react-bootstrap';
import { FaSearch, FaListUl, FaShoppingCart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../components/common/CartContext';

const normalizeSlug = (slug) =>
  slug?.toLowerCase().replace(/[\s_-]+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const categorySlugToKey = {
  'electronics': 'electronics', 'fashion': 'fashion', 'books': 'books',
  'sports': 'sports', 'home_office': 'home_office',
  'elektronik': 'electronics', 'moda': 'fashion', 'kitaplar': 'books',
  'spor': 'sports', 'ev_ofis': 'home_office',
};

const categoryNames = {
  electronics: 'Electronics', fashion: 'Fashion', books: 'Books',
  sports: 'Sports', home_office: 'Home & Office'
};

export default function ProductsEn() {
  const { category } = useParams();
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { addToCart } = useContext(CartContext);

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const baseUrl = "http://localhost:5000";
  const normalizedSlug = normalizeSlug(category);
  const categoryKey = categorySlugToKey[normalizedSlug];

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts].filter(p => p.category_key === categoryKey);
    
    let processed = result.map(p => {
      const t = p.translations?.[currentLang] || {};
      let dPrice = p.price;
      let dStock = p.stock || 0;
      let dVariant = null;

      // STOK MANTIĞI: Varyant varsa en yüksek stokluyu seç
      if (p.hasVariants && p.variants?.length > 0) {
        const sorted = [...p.variants].sort((a, b) => b.stock - a.stock);
        dVariant = sorted[0];
        dPrice = dVariant.price;
        dStock = dVariant.stock;
      }

      return {
        ...p,
        name: t.name || p.name,
        displayPrice: dPrice,
        displayStock: dStock,
        selectedVariant: dVariant,
        cleanId: p._id?.$oid || p._id
      };
    });

    if (searchQuery) {
      processed = processed.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (sortBy === 'price_asc') processed.sort((a, b) => a.displayPrice - b.displayPrice);
    if (sortBy === 'price_desc') processed.sort((a, b) => b.displayPrice - a.displayPrice);

    return processed;
  }, [allProducts, categoryKey, searchQuery, sortBy, currentLang]);

  if (!categoryKey) return <Navigate to={`/${currentLang}/404`} replace />;
  if (isLoading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5">
        <header className="text-center mb-4">
          <h1 className="fw-bold text-primary">{categoryNames[categoryKey]} Products</h1>
        </header>

        <Form className="mb-4" onSubmit={e => e.preventDefault()}>
          <InputGroup>
            <Form.Control 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
            <Form.Select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ maxWidth: '180px' }}>
              <option value="default">Default Sort</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </Form.Select>
          </InputGroup>
        </Form>

        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {filteredProducts.map(product => (
            <Col key={product.cleanId}>
              <Card className="h-100 shadow-sm">
                <Link to={`/en/${product.category_key}/${product.cleanId}`}>
                  <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                    <Card.Img 
                      src={`${product.image}`} 
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    />
                  </div>
                </Link>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6 fw-bold">
                    {product.name}
                  </Card.Title>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-danger fw-bold fs-5">${product.displayPrice}</span>
                      <small className="text-muted">Stock: {product.displayStock}</small>
                    </div>

                    {product.displayStock > 0 ? (
                      <Button 
                        variant="danger" 
                        className="w-100" 
                        onClick={() => addToCart({...product, price: product.displayPrice, image: product.image})}
                      >
                        <FaShoppingCart className="me-2" /> Add to Cart
                      </Button>
                    ) : (
                      <Button variant="secondary" className="w-100 disabled">Out of Stock</Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <ToastContainer position="top-end" className="p-3" style={{ top: '70px' }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} bg="success" delay={2000} autohide>
          <Toast.Body className="text-white">Product added to cart!</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}