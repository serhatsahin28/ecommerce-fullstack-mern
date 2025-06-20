// src/components/product/ProductCard.jsx
import React, { useState, useContext } from 'react';
import { Card, Button, Toast, ToastContainer } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { CartContext } from '../common/CartContext';

const ProductCard = ({ product }) => {
  const { t, i18n } = useTranslation('products');
  const currentLanguage = i18n.language;
  const { addToCart } = useContext(CartContext);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const formattedPrice = new Intl.NumberFormat(
    currentLanguage === 'tr' ? 'tr-TR' : 'en-US',
    {
      style: 'currency',
      currency: currentLanguage === 'tr' ? 'TRY' : 'USD',
    }
  ).format(product.price);

  return (
    <>
      <Card className="h-100 shadow-sm">

<Link
  to={`/${currentLanguage}/${product.category_key}/${product._id}`}
  className="text-decoration-none text-dark"
>
  {product.translations?.[currentLanguage]?.name || product.name}
          <Card.Img
            variant="top"
            src={product.image}
            alt={product.name}
            style={{ aspectRatio: '3/2', objectFit: 'cover' }}
          />
          <Card.Body className="d-flex flex-column">
            <Card.Title className="mb-2 h5">{product.name}</Card.Title>
            <Card.Text className="text-muted small flex-grow-1" title={product.description || ''}>
              {(product.description?.length ?? 0) > 100
                ? `${product.description.substring(0, 97)}...`
                : product.description || ''}
            </Card.Text>
          </Card.Body>
        </Link>

        <div className="px-3 pb-3">
          <p className="h5 text-primary fw-bold my-2">{formattedPrice}</p>
          <Button variant="danger" className="w-100" onClick={handleAddToCart}>
            <FaShoppingCart className="me-2" /> {t('add_to_cart')}
          </Button>
        </div>
      </Card>

      {/* Sabit ekran üstü Toast */}
    <ToastContainer
  className="position-fixed p-3"
  style={{
    top: '72px', // Navbar yüksekliğinin hemen altı
    right: '1rem',
    zIndex: 1056 // Navbar’dan yüksek olmalı
  }}
>
  <Toast
    show={showToast}
    onClose={() => setShowToast(false)}
    bg="success"
    delay={2000}
    autohide
    animation
  >
    <Toast.Body className="text-white small">
  ✅ {i18n.language === 'tr' ? 'Ürün sepete eklendi!' : 'Product added to cart!'}
</Toast.Body>

  </Toast>
</ToastContainer>

    </>
  );
};

export default ProductCard;
