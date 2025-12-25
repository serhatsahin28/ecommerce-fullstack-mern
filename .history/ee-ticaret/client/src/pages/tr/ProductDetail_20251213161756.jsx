import React, { useEffect, useState, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Container, Row, Col, Image, Button, Badge, Modal, Toast
} from 'react-bootstrap';
import {
  FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { CartContext } from '../../components/common/CartContext';  // Context yolunu kendi projene göre ayarla

const normalize = str =>
  str?.toLowerCase().replace(/[\s\-]+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const slugToCategoryKey = {
  'elektronik': 'electronics',
  'moda': 'fashion',
  'kitaplar': 'books',
  'spor': 'sports',
  'ev_ofis': 'home_office',
};

export default function ProductDetailTr() {
  const { id, category: rawCategory } = useParams();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);  // Yükleniyor durumu eklendi

  const normalizedSlug = normalize(rawCategory);
  const expectedCategoryKey = slugToCategoryKey[normalizedSlug];

  useEffect(() => {
    if (!expectedCategoryKey) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p._id === id || p.id === id);
        if (!found || found.category_key !== expectedCategoryKey) {
          setNotFound(true);
        } else {
          setProduct(found);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id, expectedCategoryKey]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h4>Yükleniyor...</h4>
      </Container>
    );
  }

  if (notFound) {
    return <Navigate to="/tr/404" replace />;
  }

  if (!product) {
    // Buraya genelde gelmez ama güvenlik için boş bırakıyorum
    return null;
  }

  const trData = product.translations?.tr || {};

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
          top: '56px', // Navbar yüksekliğine göre ayar
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          minWidth: '300px',
        }}
      >
        <Toast.Body className="text-white d-flex align-items-center">
          <FaShoppingCart className="me-2" />
          Ürün sepete eklendi!
        </Toast.Body>
      </Toast>

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
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                fluid
                alt={trData.name}
              />
            </div>
            <Row className="g-2">
              {product.images?.map((img, i) => (
                <Col xs={3} key={i}>
                  <div
                    className="border rounded p-1 d-flex align-items-center justify-content-center bg-light"
                    style={{
                      height: '80px',
                      cursor: 'zoom-in',
                      overflow: 'hidden',
                    }}
                    onClick={() => setModalIndex(i)}
                  >
                    <img
                      src={img}
                      alt={`thumbnail-${i}`}
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                </Col>
              ))}
            </Row>

          </Col>

          <Col md={6}>
            <h2 className="fw-bold">{trData.name}</h2>
            <p className="text-muted">{trData.description}</p>

            <h4 className="text-danger mb-3">{product.price} ₺</h4>

            <div className="mb-2">
              <Badge bg="warning" text="dark">
                <FaStar className="mb-1" /> {product.rating?.toFixed(1)} / 5
              </Badge>
            </div>

            <ul className="mt-3">
              {trData.features?.map((feat, i) => (
                <li key={i}>{feat}</li>
              )
              )}

              <li>
                Stok: <span className="text-danger fw-bold">{product.stock}</span>
              </li>





            </ul>

            {product.stock !== 0 ? (
              <Button
                variant="danger"
                size="lg"
                className="mt-4 w-100"
                onClick={handleAddToCart}
              >
                <FaShoppingCart className="me-2" />
                Sepete Ekle
              </Button>
            ) : (

              <div className='text-danger fw-bold'>Ürün stokta yok</div>
            )}
          </Col>
        </Row>

        {trData.reviews?.length > 0 && (
          <section className="mt-5">
            <h5>Yorumlar</h5>
            {trData.reviews.map((r, i) => (
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
