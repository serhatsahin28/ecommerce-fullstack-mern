import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Row, Col, Image, Button, Badge, Modal
} from 'react-bootstrap';
import {
  FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function ProductDetail() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const [product, setProduct] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p._id === id || p.id === id);
        setProduct(found);
      })
      .catch(err => console.error('Ürün verisi alınamadı:', err));
  }, [id]);
console.log(product);
  const openZoom = (index) => setModalIndex(index);
  const closeZoom = () => setModalIndex(null);
  const showPrev = () => setModalIndex(prev => (prev > 0 ? prev - 1 : prev));
  const showNext = () => setModalIndex(prev => (prev < product.images.length - 1 ? prev + 1 : prev));

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h4>Ürün bulunamadı</h4>
      </Container>
    );
  }

  const tData = product.translations?.[currentLang] || {};

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <div
            className="border rounded shadow-sm mb-3 d-flex align-items-center justify-content-center"
            style={{ height: '400px', cursor: 'zoom-in', overflow: 'hidden' }}
            onClick={() => openZoom(0)}
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
                  onClick={() => openZoom(i)}
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

          <Button variant="danger" size="lg" className="mt-4 w-100">
            <FaShoppingCart className="me-2" />{' '}
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

      <Modal show={modalIndex !== null} onHide={closeZoom} size="lg" centered>
        <Modal.Body className="position-relative p-0 bg-dark text-center">
          <div className="d-flex align-items-center justify-content-center" style={{ height: '80vh', overflow: 'hidden' }}>
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
              onClick={showPrev}
            >
              <FaChevronLeft />
            </Button>
          )}

          {modalIndex < product.images.length - 1 && (
            <Button
              variant="light"
              className="position-absolute top-50 end-0 translate-middle-y"
              style={{ zIndex: 1050, opacity: 0.8 }}
              onClick={showNext}
            >
              <FaChevronRight />
            </Button>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
