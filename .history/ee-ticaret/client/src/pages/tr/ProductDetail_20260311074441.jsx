import React, { useEffect, useState, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Container, Row, Col, Image, Button, Badge, Modal, Toast
} from 'react-bootstrap';
import {
  FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight, FaCheck
} from 'react-icons/fa';
import { CartContext } from '../../components/common/CartContext';

const normalize = str =>
  str?.toLowerCase().replace(/[\s\-]+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const slugToCategoryKey = {
  'elektronik': 'electronics', 'moda': 'fashion', 'kitaplar': 'books',
  'spor': 'sports', 'ev_ofis': 'home_office'
};

export default function ProductDetailTr() {
  const { id, category: rawCategory } = useParams();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null); // Seçili renk state'i
  const [modalIndex, setModalIndex] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  const normalizedSlug = normalize(rawCategory);
  const expectedCategoryKey = slugToCategoryKey[normalizedSlug];

  useEffect(() => {
    if (!expectedCategoryKey) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => (p._id?.$oid || p._id) === id);
        
        if (!found || found.category_key !== expectedCategoryKey) {
          setNotFound(true);
        } else {
          setProduct(found);
          if (found.hasVariants && found.variants?.length > 0) {
            const firstVar = found.variants[0];
            setSelectedVariant(firstVar);
            setSelectedColor(firstVar.color_name); // İlk varyantın rengini seçili başlat
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id, expectedCategoryKey]);

  if (loading) return <Container className="py-5 text-center"><h4>Yükleniyor...</h4></Container>;
  if (notFound) return <Navigate to="/tr/404" replace />;
  if (!product) return null;

  const trData = product.translations?.tr || {};

  // GÖRSEL MANTIĞI
  const gallery = (selectedVariant && selectedVariant.images?.length > 0)
    ? selectedVariant.images
    : [product.image, ...(product.extraImages || [])].filter(Boolean);

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;

  // Benzersiz renkleri filtrele
  const uniqueColors = product.hasVariants 
    ? [...new Set(product.variants.map(v => v.color_name))] 
    : [];

  // Seçili renge ait olan bedenleri/seçenekleri filtrele
  const availableSizes = product.hasVariants 
    ? product.variants.filter(v => v.color_name === selectedColor) 
    : [];

  const handleColorChange = (color) => {
    setSelectedColor(color);
    // Renk değiştiğinde o renge ait ilk bedeni otomatik seç ki fiyat/resim güncellensin
    const firstVariantOfColor = product.variants.find(v => v.color_name === color);
    setSelectedVariant(firstVariantOfColor);
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedVariant: selectedVariant,
      price: displayPrice,
      image: gallery[0]
    });
    setShowToast(true);
  };

  return (
    <>
      <Toast
        show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide bg="success"
        style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: '300px' }}
      >
        <Toast.Body className="text-white d-flex align-items-center">
          <FaCheck className="me-2" /> Ürün sepete eklendi!
        </Toast.Body>
      </Toast>

      <Container className="py-5">
        <Row>
          {/* SOL: GÖRSELLER */}
          <Col md={6}>
            <div
              className="border rounded shadow-sm mb-3 d-flex align-items-center justify-content-center bg-white"
              style={{ height: '400px', cursor: 'zoom-in', overflow: 'hidden' }}
              onClick={() => setModalIndex(0)}
            >
              <Image
                src={gallery[0]}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                fluid alt={trData.name}
              />
            </div>
            <Row className="g-2">
              {gallery.map((img, i) => (
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

          {/* SAĞ: BİLGİLER */}
          <Col md={6} className="ps-md-5">
            <h2 className="fw-bold">{trData.name}</h2>
            <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>{trData.description}</p>

            <h3 className="text-danger fw-bold my-3">{displayPrice} ₺</h3>

            <div className="mb-3">
              <Badge bg="warning" text="dark">
                <FaStar className="mb-1" /> {product.rating?.toFixed(1) || "0.0"} / 5
              </Badge>
              <span className="ms-3 text-muted">Stok durumu: <b>{displayStock > 0 ? displayStock : 'Tükendi'}</b></span>
            </div>

            {/* VARYANT SEÇENEKLERİ (RENK VE BEDEN AYRILMIŞ) */}
            {product.hasVariants && (
              <div className="my-4 p-3 bg-light rounded border">
                {/* Renk Seçimi */}
                <h6 className="fw-bold mb-2">Renk: <span className="text-primary">{selectedColor}</span></h6>
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

                {/* Beden Seçimi (Eğer varyantlarda beden bilgisi varsa gösterilir) */}
                {availableSizes.some(v => v.size) && (
                  <>
                    <h6 className="fw-bold mb-2">Beden / Seçenek: <span className="text-primary">{selectedVariant?.size}</span></h6>
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
              <h6>Öne Çıkan Özellikler:</h6>
              <ul className="small text-muted">
                {trData.features?.map((feat, i) => <li key={i}>{feat}</li>)}
              </ul>
            </div>

            <Button
              variant="danger"
              size="lg"
              className="mt-4 w-100 py-3 shadow"
              disabled={displayStock === 0}
              onClick={handleAddToCart}
            >
              <FaShoppingCart className="me-2" />
              {displayStock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
            </Button>
          </Col>
        </Row>

        {/* BÜYÜK RESİM MODAL */}
        <Modal show={modalIndex !== null} onHide={() => setModalIndex(null)} size="lg" centered>
          <Modal.Body className="p-0 bg-dark position-relative text-center">
             <Button variant="light" className="position-absolute top-0 end-0 m-2" style={{zIndex: 2000}} onClick={() => setModalIndex(null)}>X</Button>
             <div className="d-flex align-items-center justify-content-center" style={{ height: '80vh' }}>
                {modalIndex !== null && (
                  <Image 
                    src={gallery[modalIndex]} 
                    style={{ maxHeight: '100%', objectFit: 'contain' }} 
                    fluid 
                  />
                )}
             </div>
             {modalIndex > 0 && (
               <Button variant="light" className="position-absolute top-50 start-0 translate-middle-y ms-2" onClick={() => setModalIndex(prev => prev - 1)}><FaChevronLeft /></Button>
             )}
             {modalIndex !== null && modalIndex < gallery.length - 1 && (
               <Button variant="light" className="position-absolute top-50 end-0 translate-middle-y me-2" onClick={() => setModalIndex(prev => prev + 1)}><FaChevronRight /></Button>
             )}
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}