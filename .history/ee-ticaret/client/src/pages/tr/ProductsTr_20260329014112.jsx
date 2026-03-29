import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Form, Button, InputGroup, Spinner,
  Card, Toast, ToastContainer
} from 'react-bootstrap';
import { FaSearch, FaListUl, FaShoppingCart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../components/common/CartContext';

// TR slug normalize
const normalizeSlug = (slug) =>
  slug?.toLowerCase()
    .replace(/&/g, 've')
    .replace(/[\s_-]+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// TR slug -> backend key
const categorySlugToKey = {
  'elektronik': 'electronics',
  'moda': 'fashion',
  'kitaplar': 'books',
  'spor': 'sports',
  'ev_ofis': 'home_office',
};

// backend key -> TR başlık
const categoryNames = {
  electronics: 'Elektronik',
  fashion: 'Moda',
  books: 'Kitaplar',
  sports: 'Spor',
  home_office: 'Ev & Ofis',
};

export default function ProductsTr() {
  const { category } = useParams();
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'tr';
  const { addToCart } = useContext(CartContext);

  const normalizedSlug = normalizeSlug(category);
  const categoryKey = categorySlugToKey[normalizedSlug];

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const baseUrl = "http://${import.meta.env.VITE_API_URL}";

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
            features: t.features || [],
            reviews: t.reviews || [],
          };
        });
        setAllProducts(translated);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Veri alınırken hata oluştu:', err);
        setIsLoading(false);
      });
  }, [currentLang]);

  const filteredProducts = useMemo(() => {
    // Kategoriye göre filtrele
    let result = [...allProducts].filter(p => p.category_key === categoryKey);

    // --- PROFESYONEL VARYANT AYRIMI BURADA ---
    let processed = result.map(p => {
      let dPrice = p.price;
      let dStock = p.stock || 0;
      let dImage = p.image; // Varsayılan: Ürün ana resmi

      if (p.hasVariants && p.variants?.length > 0) {
        // En yüksek stoklu varyantı bul
        const bestVariant = [...p.variants].sort((a, b) => b.stock - a.stock)[0];
        
        dPrice = bestVariant.price;
        dStock = bestVariant.stock;
        
        // Varyantın kendi resmi varsa dImage o olur, yoksa p.image kalır
        if (bestVariant.images && bestVariant.images.length > 0) {
          dImage = bestVariant.images[0];
        }
      }

      return {
        ...p,
        displayPrice: dPrice,
        displayStock: dStock,
        displayImage: dImage
      };
    });

    const query = searchQuery.toLowerCase();
    if (query) {
      processed = processed.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'price_asc': processed.sort((a, b) => a.displayPrice - b.displayPrice); break;
      case 'price_desc': processed.sort((a, b) => b.displayPrice - a.displayPrice); break;
      case 'name_asc': processed.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': processed.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'rating_desc': processed.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }

    return processed;
  }, [allProducts, categoryKey, searchQuery, sortBy]);

  const handleAddToCart = (product) => {
    // Sepete seçilen görünür varyant bilgileriyle ekle
    addToCart({
      ...product,
      price: product.displayPrice,
      image: product.displayImage
    });
    setToastMessage(`${product.name} sepete eklendi!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  if (!categoryKey) return <Navigate to={`/${currentLang}/404`} replace />;

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
            {categoryNames[categoryKey]} Ürünler
          </h1>
          <p className="text-muted">Bu kategorideki en çok beğenilen ürünleri keşfedin</p>
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

        {filteredProducts.length > 0 ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredProducts.map(product => (
              <Col key={product._id}>
                <Card className="h-100 shadow-sm d-flex flex-column">
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
                      <Link to={`/tr/${category}/${product._id}`} className="text-decoration-none text-dark">
                        {product.name}
                      </Link>
                    </Card.Title>

                    <div className="mt-auto">
                      <div className="fw-bold text-danger mb-1">{product.displayPrice} ₺</div>
                      <div className="small text-muted mb-2">Stok: {product.displayStock}</div>

                      {product.displayStock !== 0 ? (
                        <Button variant="danger" size="sm" onClick={() => handleAddToCart(product)}>
                          <FaShoppingCart className="me-2" /> Sepete Ekle
                        </Button>
                      ) : (
                        <div className="text-secondary fw-bold">Stokta Bitti</div>
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
              <Card.Title>Ürün bulunamadı</Card.Title>
              <Card.Text>Arama kriterlerinize uyan ürün bulunamadı.</Card.Text>
            </Card.Body>
          </Card>
        )}
      </Container>

      <ToastContainer position="top-end" className="p-3 position-fixed" style={{ top: '70px', right: '1rem', zIndex: 1055 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} bg="success">
          <Toast.Header closeButton={false}>
            <strong className="me-auto text-white">✔</strong>
          </Toast.Header>
          <Toast.Body className="text-white small">
            ✅ {toastMessage || 'Ürün sepete eklendi!'}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}