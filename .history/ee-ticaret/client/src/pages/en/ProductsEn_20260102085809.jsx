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

  const normalizedSlug = normalizeSlug(category);
  const categoryKey = categorySlugToKey[normalizedSlug];

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const baseUrl = "http://localhost:5000";

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

  // PROFESYONEL MANTIK: En yüksek stoklu varyantı belirle
  const filteredProducts = useMemo(() => {
    let result = [...allProducts].filter(p => p.category_key === categoryKey);
    
    // Filtreleme ve Map işlemi
    let processed = result.map(p => {
      const t = p.translations?.[currentLang] || {};
      let displayPrice = p.price;
      let displayStock = p.stock || 0;
      let selectedVariant = null;

      // Eğer varyantlıysa, stoğu en yüksek olanı seç
      if (p.hasVariants && p.variants?.length > 0) {
        const sorted = [...p.variants].sort((a, b) => b.stock - a.stock);
        selectedVariant = sorted[0];
        displayPrice = selectedVariant.price;
        displayStock = selectedVariant.stock;
      }

      return {
        ...p,
        name: t.name || p.name,
        displayPrice,
        displayStock,
        selectedVariant,
        cleanId: p._id?.$oid || p._id
      };
    });

    // Arama Sorgusu
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      processed = processed.filter(p => p.name.toLowerCase().includes(q));
    }

    // Sıralama
    switch (sortBy) {
      case 'price_asc': processed.sort((a, b) => a.displayPrice - b.displayPrice); break;
      case 'price_desc': processed.sort((a, b) => b.displayPrice - a.displayPrice); break;
      case 'rating_desc': processed.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }

    return processed;
  }, [allProducts, categoryKey, searchQuery, sortBy, currentLang]);

  const handleAddToCart = (product) => {
    const cartItem = {
      ...product,
      id: product.selectedVariant ? `${product.cleanId}-${product.selectedVariant.variant_id}` : product.cleanId,
      price: product.displayPrice,
      image: product.selectedVariant?.images?.[0] || product.image
    };
    addToCart(cartItem);
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
  };

  if (!categoryKey) return <Navigate to={`/${currentLang}/404`} replace />;
  if (isLoading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Container className="py-5">
        <header className="text-center mb-5">
          <h1 className="fw-bold text-primary">{categoryNames[categoryKey]}</h1>
          <p className="text-muted">High-stock variants selected automatically for you.</p>
        </header>

        <Form className="mb-4" onSubmit={e => e.preventDefault()}>
          <InputGroup className="shadow-sm">
            <Form.Control 
                placeholder="Search products..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
            />
            <Form.Select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ maxWidth: '200px' }}>
              <option value="default">Sort By</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Best Rating</option>
            </Form.Select>
          </InputGroup>
        </Form>

        {filteredProducts.length > 0 ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredProducts.map(product => (
              <Col key={product.cleanId}>
                <Card className="h-100 border-0 shadow-sm overflow-hidden">
                  <Link to={`/en/${product.category_key}/${product.cleanId}`}>
                    <div style={{ height: "250px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px" }}>
                      <Card.Img 
                        variant="top" 
                        src={product.image?.startsWith('http') ? product.image : `${baseUrl}${product.image}`} 
                        style={{ maxHeight: "100%", objectFit: "contain" }}
                      />
                    </div>
                  </Link>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fs-6 mb-2">
                      <Link to={`/en/${product.category_key}/${product.cleanId}`} className="text-decoration-none text-dark fw-bold">
                        {product.name}
                      </Link>
                    </Card.Title>
                    
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-primary fw-bold fs-5">${product.displayPrice}</span>
                        {product.displayStock > 0 && (
                          <Badge bg="success-subtle" text="success">Stock: {product.displayStock}</Badge>
                        )}
                      </div>

                      {product.displayStock > 0 ? (
                        <Button variant="danger" className="w-100 rounded-pill" onClick={() => handleAddToCart(product)}>
                          <FaShoppingCart className="me-2" /> Add to Cart
                        </Button>
                      ) : (
                        <Button variant="secondary" className="w-100 rounded-pill disabled">Out of Stock</Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5"><FaListUl size={50} className="text-muted mb-3" /><h4>No products found.</h4></div>
        )}
      </Container>

      <ToastContainer position="top-end" className="p-3" style={{ top: '70px', zIndex: 1055 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} bg="success" delay={2000} autohide>
          <Toast.Body className="text-white">✅ {toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}