import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Badge, Modal } from 'react-bootstrap';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import productsData from '../../locales/en/products_with_gallery_en.json';

export default function ProductDetailEN() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const found = productsData.items.find(p => p.id === id);
    setProduct(found);
    setSelectedImage(found?.images?.[0] || found?.image);
  }, [id]);

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
        {/* Left - Gallery */}
        <Col md={6}>
          <div className="mb-3 border rounded shadow-sm" style={{ cursor: 'zoom-in' }} onClick={() => setShowModal(true)}>
            <Image src={selectedImage} fluid />
          </div>

          <Row className="g-2">
            {product.images?.map((img, i) => (
              <Col xs={3} key={i}>
                <Image
                  src={img}
                  fluid
                  thumbnail
                  onClick={() => setSelectedImage(img)}
                  style={{ border: selectedImage === img ? '2px solid red' : '1px solid #ccc', cursor: 'pointer' }}
                />
              </Col>
            ))}
          </Row>
        </Col>

        {/* Right - Info */}
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

      {/* Reviews */}
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

      {/* Zoom Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Body className="p-0">
          <Image src={selectedImage} fluid />
        </Modal.Body>
      </Modal>
    </Container>
  );
}
