// src/pages/ProductDetailTR.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Modal } from 'react-bootstrap';
import { FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight, FaSearchPlus } from 'react-icons/fa';
import productsData from '../../locales/tr/products.json';

export default function ProductDetailTR() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [showZoom, setShowZoom] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);

  useEffect(() => {
    const found = productsData.items.find(p => p.id === id);
    setProduct(found);
    if (found) {
      const firstImage = found.images?.[0] || found.image;
      setSelectedImage(firstImage);
    }
  }, [id]);

  const handleZoom = (index) => {
    setZoomIndex(index);
    setShowZoom(true);
  };

  const handleNext = () => {
    if (product?.images && zoomIndex < product.images.length - 1) {
      setZoomIndex(zoomIndex + 1);
    }
  };

  const handlePrev = () => {
    if (product?.images && zoomIndex > 0) {
      setZoomIndex(zoomIndex - 1);
    }
  };

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h4>Ürün bulunamadı</h4>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        {/* Image Gallery */}
        <Col md={6}>
          <div className="position-relative">
            <Image
              src={selectedImage}
              fluid
              className="border rounded shadow-sm w-100"
              style={{ cursor: 'zoom-in' }}
              onClick={() => handleZoom(product.images?.indexOf(selectedImage) || 0)}
            />
            <FaSearchPlus
              onClick={() => handleZoom(product.images?.indexOf(selectedImage) || 0)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                color: '#fff',
                background: '#000',
                borderRadius: '50%',
                padding: '5px',
                cursor: 'pointer'
              }}
            />
          </div>
          <Row className="mt-3">
            {product.images?.map((img, i) => (
              <Col xs={3} key={i}>
                <Image
                  src={img}
                  thumbnail
                  fluid
                  style={{ height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => setSelectedImage(img)}
                />
              </Col>
            ))}
          </Row>
        </Col>

        {/* Product Details */}
        <Col md={6}>
          <h2 className="fw-bold">{product.name}</h2>
          <p className="text-muted">{product.description}</p>
          <h4 className="text-danger mb-3">{product.price}₺</h4>
          <div className="mb-2">
            <span className="text-warning"><FaStar /> {product.rating?.toFixed(1) || '0.0'}/5</span>
          </div>
          <ul className="mt-3">
            {product.features?.map((feat, i) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>
          <Button variant="danger" size="lg" className="mt-4 w-100">
            <FaShoppingCart className="me-2" /> Sepete Ekle
          </Button>
        </Col>
      </Row>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <section className="mt-5">
          <h5>Müşteri Yorumları</h5>
          {product.reviews.map((r, i) => (
            <blockquote key={i} className="blockquote border-start border-4 ps-3 mb-3">
              “{r}”
            </blockquote>
          ))}
        </section>
      )}

      {/* Zoom Modal */}
      <Modal show={showZoom} onHide={() => setShowZoom(false)} size="lg" centered>
        <Modal.Body className="text-center position-relative">
          <Image
            src={product.images?.[zoomIndex]}
            fluid
            style={{ maxHeight: '80vh', objectFit: 'contain' }}
          />
          <Button variant="light" className="position-absolute top-50 start-0" onClick={handlePrev} disabled={zoomIndex === 0}>
            <FaChevronLeft />
          </Button>
          <Button variant="light" className="position-absolute top-50 end-0" onClick={handleNext} disabled={zoomIndex === product.images.length - 1}>
            <FaChevronRight />
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
