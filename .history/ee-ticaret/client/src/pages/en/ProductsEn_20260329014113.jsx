import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Form, Button, InputGroup, Spinner,
  Card, Toast, ToastContainer
} from 'react-bootstrap';
import { FaSearch, FaListUl, FaShoppingCart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../components/common/CartContext';

const normalizeSlug = (slug) =>
  slug?.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[\s_-]+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

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
  const [toastMessage, setToastMessage] = useState('');

  const baseUrl = "http://${import.meta.env.VITE_API_URL}";
  const normalizedSlug = normalizeSlug(category);
  const categoryKey = categorySlugToKey[normalizedSlug];

  useEffect(() => {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/products')
      .then(res => res.json())
      .then(data => {
        const translated = data.map(item => {
          const t = item.translations?.[currentLang] || {};
          return {
            ...item,
            name: t.name || item.name,
            description: t.description || item.description,
          };
        });
        setAllProducts(translated);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Veri hatası:', err);
        setIsLoading(false);
      });
  }, [currentLang]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts].filter(p => p.category_key === categoryKey);

    return result.map(p => {
      // --- AYRIM BURADA BAŞLIYOR ---
      let dPrice, dStock, dImage;

      if (!p.hasVariants || !p.variants || p.variants.length === 0) {
        // DURUM A: VARYANT YOKSA
        dPrice = p.price;
        dStock = p.stock || 0;
        dImage = p.image; // Doğrudan ürünün ana resmi
      } else {
        // DURUM B: VARYANT VARSA
        // Stoğu en yüksek varyantı buluyoruz
        const bestVariant = [...p.variants].sort((a, b) => b.stock - a.stock)[0];
        dPrice = bestVariant.price;
        dStock = bestVariant.stock;
        // Varyantın resmi varsa onu, yoksa ana resmi alıyoruz
        dImage = (bestVariant.images && bestVariant.images.length > 0) 
                 ? bestVariant.images[0] 
                 : p.image;
      }
      // --- AYRIM BURADA BİTTİ ---

      return {
        ...p,
        displayPrice: dPrice,
        displayStock: dStock,
        displayImage: dImage
      };
    });
  }, [allProducts, categoryKey]);

  // Arama ve Sıralama (Ayrı bir adım olarak daha temiz)
  const finalProducts = useMemo(() => {
    let list = [...filteredProducts];
    const query = searchQuery.toLowerCase();
    if (query) {
      list = list.filter(p => p.name.toLowerCase().includes(query));
    }
    if (sortBy === 'price_asc') list.sort((a, b) => a.displayPrice - b.displayPrice);
    if (sortBy === 'price_desc') list.sort((a, b) => b.displayPrice - a.displayPrice);
    return list;
  }, [filteredProducts, searchQuery, sortBy]);

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      price: product.displayPrice,
      image: product.displayImage
    });
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  if (!categoryKey) return <Navigate to={`/${currentLang}/404`} replace />;
  if (isLoading) return <Container className="py-5 text-center"><Spinner animation="border" variant="primary" /></Container>;

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5">
        <header className="text-center mb-4">
          <h1 className="display-5 fw-bold text-primary">{categoryNames[categoryKey]} Products</h1>
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
            </Form.Select>
          </InputGroup>
        </Form>

        {finalProducts.length > 0 ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {finalProducts.map(product => (
              <Col key={product._id}>
                <Card className="h-100 shadow-sm d-flex flex-column">
                  {/* TASARIM KORUNDU */}
                  <div style={{ height: "300px", width: "100%", backgroundColor: "#f8f9fa", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                    <Card.Img
                      variant="top"
                      src={product.displayImage}
                      alt={product.name}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>
                      <Link to={`/en/${product.category_key}/${product._id}`} className="text-decoration-none text-dark">
                        {product.name}
                      </Link>
                    </Card.Title>
                    <div className="mt-auto">
                      <div className="fw-bold text-primary mb-1">${product.displayPrice}</div>
                      
                      {/* AYRIM: Stok metni buradan gelir */}
                      <div className="small text-muted mb-2">Stock: {product.displayStock}</div>
                      
                      {product.displayStock !== 0 ? (
                        <Button variant="danger" size="sm" onClick={() => handleAddToCart(product)}>
                          <FaShoppingCart className="me-2" /> Add to Cart
                        </Button>
                      ) : (
                        <div className="text-secondary fw-bold">Out of stock</div>
                      )}
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
            </Card.Body>
          </Card>
        )}
      </Container>

      <ToastContainer position="top-end" className="p-3 position-fixed" style={{ top: '70px', right: '1rem', zIndex: 1055 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} bg="success">
          <Toast.Body className="text-white small">
            ✅ {toastMessage || 'Product added to cart!'}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}