import React, { useEffect, useState, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Container, Row, Col, Image, Button, Badge, Modal, Toast
} from 'react-bootstrap';
import {
  FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../components/common/CartContext';

const normalize = str =>
  str?.toLowerCase().replace(/[\s\-]+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const slugToCategoryKey = {
  'elektronik': 'electronics',
  'moda': 'fashion',
  'kitaplar': 'books',
  'spor': 'sports',
  'ev_ofis': 'home_office',
  'electronics': 'electronics',
  'fashion': 'fashion',
  'books': 'books',
  'sports': 'sports',
  'home_office': 'home_office',
};

export default function ProductDetail() {
  const { id, category: rawCategory } = useParams();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const [product, setProduct] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { addToCart } = useContext(CartContext);

  const normalizedSlug = normalize(rawCategory);
  const expectedCategoryKey = slugToCategoryKey[normalizedSlug];

  useEffect(() => {
    if (!expectedCategoryKey) {
      setNotFound(true);
      return;
    }

    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p._id === id || p.id === id);
        if (!found || found.category_key !== expectedCategoryKey) {
          setNotFound(true);
        } else {
          setProduct(found);
        }
      })
      .catch(err => {
        console.error('Ürün verisi alınamadı:', err);
        setNotFound(true);
      });
  }, [id, expectedCategoryKey]);

  if (notFound) {
    return <Navigate to={`/${currentLang}/404`} replace />;
  }

  if (!product && !notFound) {
    return (
      <Container className="py-5 text-center">
        <h4>{currentLang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</h4>
      </Container>
    );
  }

  const tData = product.translations?.[currentLang] || {};

  const handleAddToCart = () => {
    addToCart(product);
    setShowToast(true);
  };

  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={2000}
        autohide
        bg="success"
        style={{
          position: 'fixed',
          top: '56px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          minWidth: '300px',
        }}
      >
        <Toast.Body className="text-white d-flex align-items-center">
          <FaShoppingCart className="me-2" />
          {currentLang === 'tr' ? 'Ürün sepete eklendi!' : 'Item added to cart!'}
        </Toast.Body>
      </Toast>

      <Container className="py-5 position-relative">
        <Row>
          <Col md={6}>
            <div
              className="border rounded shadow-sm mb-3 d-flex align-items-center justify-content-center"
              style={{ height: '400px', cursor: 'zoom-in', overflow: 'hidden' }}
              onClick={() => setModalIndex(0)}
            >
              <Image
                src={product.images?.[0] || product.image}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                fluid
                alt={tData.name}
              />
            </div>
            <Row className="g-2">
              {product.images?.map((img, i) => (
                <Col xs={3} key={i}>
                  <div
                    className="border rounded p-1"
                    style={{ height: '80px', cursor: 'zoom-in', overflow: 'hidden' }}
                    onClick={() => setModalIndex(i)}
                  >
                    <Image
                      src={img}
                      style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                      fluid
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Col>

          <Col md={6}>
            <h2 className="fw-bold">{tData.name}</h2>
            <p className="text-muted">{tData.description}</p>

            <h4 className="text-danger mb-3">
              {currentLang === 'tr' ? `${product.price} ₺` : `$${product.price}`}
            </h4>

            <div className="mb-2">
              <Badge bg="warning" text="dark">
                <FaStar className="mb-1" /> {product.rating?.toFixed(1)} / 5
              </Badge>
            </div>

            <ul className="mt-3">
              {tData.features?.map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>

            <Button
              variant="danger"
              size="lg"
              className="mt-4 w-100"
              onClick={handleAddToCart}
            >
              <FaShoppingCart className="me-2" />
              {currentLang === 'tr' ? 'Sepete Ekle' : 'Add to Cart'}
            </Button>
          </Col>
        </Row>

        {tData.reviews?.length > 0 && (
          <section className="mt-5">
            <h5>{currentLang === 'tr' ? 'Yorumlar' : 'Customer Reviews'}</h5>
            {tData.reviews.map((r, i) => (
              <blockquote key={i} className="blockquote border-start border-4 ps-3 mb-3">
                “{r}”
              </blockquote>
            ))}
          </section>
        )}

        <Modal show={modalIndex !== null} onHide={() => setModalIndex(null)} size="lg" centered>
          <Modal.Body className="position-relative p-0 bg-dark text-center">
            <div className="d-flex align-items-center justify-content-center" style={{ height: '80vh' }}>
              <Image
                src={product.images[modalIndex]}
                style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                fluid
              />
            </div>

            {modalIndex > 0 && (
              <Button
                variant="light"
                className="position-absolute top-50 start-0 translate-middle-y"
                style={{ zIndex: 1050, opacity: 0.8 }}
                onClick={() => setModalIndex(prev => prev - 1)}
              >
                <FaChevronLeft />
              </Button>
            )}

            {modalIndex < product.images.length - 1 && (
              <Button
                variant="light"
                className="position-absolute top-50 end-0 translate-middle-y"
                style={{ zIndex: 1050, opacity: 0.8 }}
                onClick={() => setModalIndex(prev => prev + 1)}
              >
                <FaChevronRight />
              </Button>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}
