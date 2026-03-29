import React, { useEffect, useState, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Container, Row, Col, Image, Button, Badge, Modal, Toast
} from 'react-bootstrap';
import {
  FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight, FaCheck
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../components/common/CartContext';

const normalize = str =>
  str?.toLowerCase().replace(/[\s\-]+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const slugToCategoryKey = {
  'elektronik': 'electronics', 'moda': 'fashion', 'kitaplar': 'books',
  'spor': 'sports', 'ev_ofis': 'home_office', 'electronics': 'electronics',
  'fashion': 'fashion', 'books': 'books', 'sports': 'sports', 'home_office': 'home_office',
};

export default function ProductDetail() {
  const { id, category: rawCategory } = useParams();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null); // Yeni: Seçili renk state'i
  const [modalIndex, setModalIndex] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  const normalizedSlug = normalize(rawCategory);
  const expectedCategoryKey = slugToCategoryKey[normalizedSlug];

  useEffect(() => {
    if (!expectedCategoryKey) { setNotFound(true); return; }

    fetch(`http://${import.meta.env.VITE_API_URL}/admin/productsList`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => {
          const pId = p._id?.$oid || p._id; 
          return pId === id;
        });

        if (!found || found.category_key !== expectedCategoryKey) {
          setNotFound(true);
        } else {
          setProduct(found);
          if (found.hasVariants && found.variants?.length > 0) {
            const firstVariant = found.variants[0];
            setSelectedVariant(firstVariant);
            setSelectedColor(firstVariant.color_name); // İlk varyantın rengini ata
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id, expectedCategoryKey]);

  if (notFound) return <Navigate to={`/${currentLang}/404`} replace />;
  if (loading) return <Container className="py-5 text-center"><h4>{currentLang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</h4></Container>;
  if (!product) return null;

  const tData = product.translations?.[currentLang] || {};

  // Galeri Yönetimi
  const currentGallery = (selectedVariant && selectedVariant.images?.length > 0)
    ? selectedVariant.images
    : [product.image, ...(product.extraImages || [])].filter(Boolean);

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;

  // Benzersiz renkleri al
  const uniqueColors = product.hasVariants 
    ? [...new Set(product.variants.map(v => v.color_name))] 
    : [];

  // Seçili renge ait bedenleri filtrele
  const availableSizes = product.hasVariants 
    ? product.variants.filter(v => v.color_name === selectedColor) 
    : [];

  const handleColorChange = (color) => {
    setSelectedColor(color);
    // Renk değiştiğinde, o renge ait ilk bedeni otomatik seç
    const firstVariantOfColor = product.variants.find(v => v.color_name === color);
    setSelectedVariant(firstVariantOfColor);
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      cartId: selectedVariant ? `${product._id}-${selectedVariant.variant_id}` : product._id,
      name: tData.name,
      price: displayPrice,
      selectedVariant: selectedVariant,
      image: currentGallery[0]
    };
    addToCart(cartItem);
    setShowToast(true);
  };

  return (
    <>
      <Toast
        show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide bg="success"
        style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: '300px' }}
      >
        <Toast.Body className="text-white d-flex align-items-center">
          <FaCheck className="me-2" /> {currentLang === 'tr' ? 'Ürün sepete eklendi!' : 'Item added to cart!'}
        </Toast.Body>
      </Toast>

      <Container className="py-5">
        <Row>
          <Col md={6}>
            {/* ANA GÖRSEL */}
            <div
              className="border rounded shadow-sm mb-3 d-flex align-items-center justify-content-center bg-white"
              style={{ height: '450px', cursor: 'zoom-in', overflow: 'hidden' }}
              onClick={() => setModalIndex(0)}
            >
              <Image
                src={currentGallery[0]}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                fluid alt={tData.name}
                onError={(e) => { e.target.src = "via.placeholder.com/450?text=Resim+Bulunamadi"; }}
              />
            </div>
            {/* KÜÇÜK RESİMLER (THUMBNAILS) */}
            <Row className="g-2">
              {currentGallery.map((img, i) => (
                <Col xs={3} key={i}>
                  <div
                    className={`border rounded p-1 d-flex align-items-center justify-content-center bg-light ${modalIndex === i ? 'border-primary' : ''}`}
                    style={{ height: '80px', cursor: 'pointer', overflow: 'hidden' }}
                    onClick={() => setModalIndex(i)}
                  >
                    <img 
                      src={img} 
                      alt="thumb" 
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Col>

          <Col md={6} className="ps-md-5">
            <Badge bg="dark" className="mb-2">{product.category_key.toUpperCase()}</Badge>
            <h2 className="fw-bold">{tData.name}</h2>
            
            <div className="d-flex align-items-center gap-3 mb-3">
              <h3 className="text-danger mb-0 fw-bold">{displayPrice} ₺</h3>
              <Badge bg="warning" text="dark"><FaStar /> {product.rating?.toFixed(1) || "0.0"}</Badge>
            </div>

            <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>{tData.description}</p>

            {/* VARYANT SEÇİM ALANI (YENİLENMİŞ) */}
            {product.hasVariants && (
              <div className="my-4 p-3 bg-light rounded border">
                {/* Renk Seçimi */}
                <h6 className="fw-bold mb-2">{currentLang === 'tr' ? 'Renk' : 'Color'}: {selectedColor}</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {uniqueColors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "dark" : "outline-dark"}
                      size="sm"
                      onClick={() => handleColorChange(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>

                {/* Beden Seçimi (Sadece seçili renge ait olanlar) */}
                {availableSizes.some(v => v.size) && (
                  <>
                    <h6 className="fw-bold mb-2">{currentLang === 'tr' ? 'Beden' : 'Size'}: {selectedVariant?.size}</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {availableSizes.map((v) => (
                        <Button
                          key={v.variant_id}
                          variant={selectedVariant?.variant_id === v.variant_id ? "primary" : "outline-primary"}
                          size="sm"
                          onClick={() => setSelectedVariant(v)}
                        >
                          {v.size}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-4">
              <h6>{currentLang === 'tr' ? 'Ürün Özellikleri' : 'Features'}</h6>
              <ul className="text-muted small">
                {tData.features?.map((feat, i) => <li key={i}>{feat}</li>)}
              </ul>
            </div>

            <div className="mt-5">
              {displayStock > 0 ? (
                <Button variant="danger" size="lg" className="w-100 py-3 shadow" onClick={handleAddToCart}>
                  <FaShoppingCart className="me-2" /> {currentLang === 'tr' ? 'SEPETE EKLE' : 'ADD TO CART'}
                </Button>
              ) : (
                <Button variant="secondary" size="lg" className="w-100 py-3 disabled">
                  {currentLang === 'tr' ? 'STOKTA YOK' : 'OUT OF STOCK'}
                </Button>
              )}
            </div>
          </Col>
        </Row>

        {/* MODAL (Görsel Büyütme) */}
        <Modal show={modalIndex !== null} onHide={() => setModalIndex(null)} size="lg" centered>
          <Modal.Body className="p-0 bg-dark position-relative text-center">
             <Button variant="light" className="position-absolute top-0 end-0 m-2" style={{zIndex: 2000}} onClick={() => setModalIndex(null)}>X</Button>
             <div className="d-flex align-items-center justify-content-center" style={{ height: '80vh' }}>
                {modalIndex !== null && currentGallery[modalIndex] && (
                  <Image 
                    src={ currentGallery[modalIndex]} 
                    style={{ maxHeight: '100%', objectFit: 'contain' }} 
                    fluid 
                  />
                )}
             </div>
             {modalIndex > 0 && (
               <Button variant="light" className="position-absolute top-50 start-0 translate-middle-y ms-2" onClick={() => setModalIndex(prev => prev - 1)}><FaChevronLeft /></Button>
             )}
             {modalIndex !== null && modalIndex < currentGallery.length - 1 && (
               <Button variant="light" className="position-absolute top-50 end-0 translate-middle-y me-2" onClick={() => setModalIndex(prev => prev + 1)}><FaChevronRight /></Button>
             )}
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}