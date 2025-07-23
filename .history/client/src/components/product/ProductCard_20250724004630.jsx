// src/components/product/ProductCard.js

import React, { useState, useContext } from 'react';
import { Card, Button, Toast, ToastContainer } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { CartContext } from '../common/CartContext';

// URL uyumlu kategori slug çevirisi
const categorySlugMap = {
  electronics: { tr: 'elektronik', en: 'electronics' },
  fashion:     { tr: 'moda',       en: 'fashion' },
  books:       { tr: 'kitaplar',   en: 'books' },
  sports:      { tr: 'spor',       en: 'sports' },
  home_office: { tr: 'ev-ofis',    en: 'home-office' }
};

const ProductCard = ({ product, lang = 'en' }) => {
  const { addToCart } = useContext(CartContext);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = () => {
    console.log("Sepete eklenen ürün:", product);
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Güvenli çeviri alma + fallback'li ad ve açıklama
  const localized = product.translations?.[lang] || {};
  const name = localized.name || product.name || 'İsimsiz Ürün';
  const description = localized.description || product.description || '';

  // Fiyat formatlama
  const formattedPrice = new Intl.NumberFormat(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    {
      style: 'currency',
      currency: lang === 'tr' ? 'TRY' : 'USD',
    }
  ).format(product.price || 0);

  // URL oluşturma
  const categorySlug = categorySlugMap[product.category_key]?.[lang] || product.category_key;
  const productUrl = `/${lang}/${categorySlug}/${product.product_id}`;

  return (
    <>
      <Card className="h-100 shadow-sm d-flex flex-column">
        <Link
          to={productUrl}
          className="text-decoration-none text-dark"
        >
        <Card.Img
  variant="top"
  src={product.image}
  alt={product.name}
  style={{
    objectFit: 'contain',
    maxHeight: '200px',
    width: '100%',
    backgroundColor: '#f8f9fa',
  }}
/>

          <Card.Body className="d-flex flex-column justify-content-between">
            <div>
              {product.category_title && (
                <Card.Subtitle className="mb-2 text-muted small">
                  {product.category_title}
                </Card.Subtitle>
              )}

              <Card.Title
                className="mb-2 fs-6 fw-bold text-truncate"
                title={name}
              >
                {name}
              </Card.Title>

              <Card.Text
                className="text-muted small"
                style={{
                  minHeight: '3em',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {description}
              </Card.Text>
            </div>
          </Card.Body>
        </Link>

        <div className="px-3 pb-3 mt-auto">
          <p className="h6 text-danger fw-semibold my-2">{formattedPrice}</p>
          <Button
            variant="primary"
            className="w-100"
            onClick={handleAddToCart}
          >
            <FaShoppingCart className="me-2" />
            {lang === 'tr' ? 'Sepete Ekle' : 'Add to Cart'}
          </Button>
        </div>
      </Card>

      {/* Toast Bildirimi */}
      <ToastContainer
        className="position-fixed p-3"
        style={{ top: '72px', right: '1rem', zIndex: 1056 }}
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
            ✅ {lang === 'tr' ? 'Ürün sepete eklendi!' : 'Product added to cart!'}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default ProductCard;
