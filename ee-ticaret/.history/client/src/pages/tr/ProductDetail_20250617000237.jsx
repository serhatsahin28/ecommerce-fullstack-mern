import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Container, Row, Col, Image, Button, Badge, Modal
} from 'react-bootstrap';
import { FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Slug normalizasyon fonksiyonu
const normalize = (str) =>
  str?.toLowerCase().replace(/[\s\-]+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Sadece TR sluglar için kategori eşlemesi
const slugToCategoryKey = {
  'elektronik': 'electronics',
  'moda': 'fashion',
  'kitaplar': 'books',
  'spor': 'sports',
  'ev_ofis': 'home_office',
};

export default function ProductDetailTR() {
  const { id, category: rawCategory } = useParams();
  const { i18n } = useTranslation();

  const [product, setProduct] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const normalizedSlug = normalize(rawCategory);
  const expectedCategoryKey = slugToCategoryKey[normalizedSlug];

  // TR dışı diller için doğrudan 404 yönlendirmesi
  if (i18n.language !== 'tr') {
    return <Navigate to="/tr/404" replace />;
  }

  useEffect(() => {
    if (!expectedCategoryKey) {
      setNotFound(true);
      return;
    }

    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => String(p._id) === String(id) || String(p.id) === String(id));
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

  if (notFound) return <Navigate to="/tr/404" replace />;

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h4>Ürün bulunamadı</h4>
      </Container>
    );
  }

  const tr = product.translations?.tr || {};

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <div
            className="border rounded shadow-sm mb-3 d-flex align-items-center justify-content-center"
            style={{ height: '400px', cursor: 'zoom-in', overflow: 'hidden' }}
            onClick={() => setModalIndex(0)}
          >
            <Image
              src={product.images?.[0] || product.image}
              alt={tr.name}
              fluid
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
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
                  <Image src={img} fluid style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                </div>
              </Col>
            ))}
          </Row>
        </Col>

        <Col md={6}>
          <h2 className="fw-bold">{tr.name}</h2>
          <p className="text-muted">{tr.description}</p>

          <h4 className="text-danger mb-3">{product.price} ₺</h4>

          <div className="mb-2">
            <Badge bg="warning" text="dark">
              <FaStar className="mb-1" /> {product.rating?.toFixed(1)} / 5
            </Badge>
          </div>

          <ul className="mt-3">
            {tr.features?.map((feat, i) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>

          <Button variant="danger" size="lg" className="mt-4 w-100">
            <FaShoppingCart className="me-2" /> Sepete Ekle
          </Button>
        </Col>
      </Row>

      {tr.reviews?.length > 0 && (
        <section className="mt-5">
          <h5>Müşteri Yorumları</h5>
          {tr.reviews.map((r, i) => (
            <blockquote key={i} className="blockquote border-start border-4 ps-3 mb-3">“{r}”</blockquote>
          ))}
        </section>
      )}

      <Modal show={modalIndex !== null} onHide={() => setModalIndex(null)} size="lg" centered>
        <Modal.Body className="position-relative p-0 bg-dark text-center">
          <div className="d-flex align-items-center justify-content-center" style={{ height: '80vh', overflow: 'hidden' }}>
            <Image
              src={product.images[modalIndex]}
              fluid
              style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
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
  );
}
