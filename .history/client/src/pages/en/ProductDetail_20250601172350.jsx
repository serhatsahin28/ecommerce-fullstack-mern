import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Badge, Modal } from 'react-bootstrap';
import { FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import productsData from '../../locales/en/products.json';


export default function ProductDetailEN() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [modalIndex, setModalIndex] = useState(null);

  useEffect(() => {
    const found = productsData.items.find(p => p.id === id);
    setProduct(found);
    setSelectedImage(found?.images?.[0] || found?.image);
  }, [id]);

  const openZoom = (index) => setModalIndex(index);
  const closeZoom = () => setModalIndex(null);

  const showPrev = () => setModalIndex(prev => (prev > 0 ? prev - 1 : prev));
  const showNext = () => setModalIndex(prev => (prev < (product.images.length - 1) ? prev + 1 : prev));

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h4>Product not found</h4>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        {/* Main image (değişmez) */}
        <Col md={6}>
          <div className="mb-3 border rounded shadow-sm">
            <Image src={selectedImage} fluid />
          </div>

          <Row className="g-2">
            {product.images?.map((img, i) => (
              <Col xs={3} key={i}>
                <Image
                  src={img}
                  fluid
                  thumbnail
                  onClick={() => openZoom(i)}
                  style={{ cursor: 'zoom-in' }}
                />
              </Col>
            ))}
          </Row>
        </Col>

        {/* Ürün bilgileri */}
        <Col md={6}>
          <h2 className="fw-bold">{product.name}</h2>
          <p className="text-muted">{product.description}</p>

          <h4 className="text-danger mb-3">${product.price}</h4>

          <div className="mb-2">
            <Badge bg="warning" text="dark">
              <FaStar className="mb-1" /> {product.rating?.toFixed(1)} / 5
            </Badge>
          </div>

          <ul className="mt-3">
            {product.features?.map((feat, i) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>

          <Button variant="danger" size="lg" className="mt-4 w-100">
            <FaShoppingCart className="me-2" /> Add to Cart
          </Button>
        </Col>
      </Row>

      {/* Yorumlar */}
      {product.reviews?.length > 0 && (
        <section className="mt-5">
          <h5>Customer Reviews</h5>
          {product.reviews.map((r, i) => (
            <blockquote key={i} className="blockquote border-start border-4 ps-3 mb-3">
              “{r}”
            </blockquote>
          ))}
        </section>
      )}

      {/* Modal Zoom */}
      <Modal show={modalIndex !== null} onHide={closeZoom} size="lg" centered>
        <Modal.Body className="position-relative p-0">
          <Image
            src={product.images[modalIndex]}
            fluid
            className="w-100"
            style={{ objectFit: 'contain', maxHeight: '80vh' }}
          />

          {/* Sol - Önceki butonu */}
          {modalIndex > 0 && (
            <Button
              variant="dark"
              className="position-absolute top-50 start-0 translate-middle-y"
              style={{ zIndex: 10, opacity: 0.7 }}
              onClick={showPrev}
            >
              <FaChevronLeft />
            </Button>
          )}

          {/* Sağ - Sonraki butonu */}
          {modalIndex < product.images.length - 1 && (
            <Button
              variant="dark"
              className="position-absolute top-50 end-0 translate-middle-y"
              style={{ zIndex: 10, opacity: 0.7 }}
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
