""import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Container, Row, Col, Image, Button, Badge, Modal
} from 'react-bootstrap';
import { FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const validCategories = ['elektronik', 'moda', 'kitaplar', 'spor', 'ev_ofis'];

export default function ProductDetailTR() {
  const { id, category } = useParams();
  const [product, setProduct] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!validCategories.includes(category)) return;

    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => String(p._id) === String(id));
        if (!found) {
          console.warn('Ürün bulunamadı:', id);
        }
        setProduct(found);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Ürün verisi alınamadı:', err);
        setIsLoading(false);
      });
  }, [id, category]);

  if (!validCategories.includes(category)) {
    return <Navigate to="/tr/404" replace />;
  }

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <h4>Yükleniyor...</h4>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h4>Ürün bulunamadı</h4>
      </Container>
    );
  }

  const tr = product.translations?.tr || {};

  const openZoom = (index) => setModalIndex(index);
  const closeZoom = () => setModalIndex(null);
  const showPrev = () => setModalIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const showNext = () => setModalIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : prev));

  return (
    <Container className="py-5">
      <Row>
        {/* Görsel Galeri */}
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
              alt={tr.name}
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

        {/* Ürün Bilgileri */}
        <Col md={6}>
          <h2 className="fw-bold">{tr.name}</h2>
          <p className="text-muted">{tr.description}</p>

          <h4 className="text-danger mb-3">{product.price}₺</h4>

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

      {/* Müşteri Yorumları */}
      {tr.reviews?.length > 0 && (
        <section className="mt-5">
          <h5>Müşteri Yorumları</h5>
          {tr.reviews.map((r, i) => (
            <blockquote key={i} className="blockquote border-start border-4 ps-3 mb-3">
              “{r}”
            </blockquote>
          ))}
        </section>
      )}

      {/* Zoom Modal */}
      <Modal show={modalIndex !== null} onHide={closeZoom} size="lg" centered>
        <Modal.Body className="position-relative p-0 bg-dark text-center">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ height: '80vh', overflow: 'hidden' }}
          >
            <Image
              src={product.images[modalIndex]}
              style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
              fluid
            />
          </div>

          {/* Geri */}
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

          {/* İleri */}
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