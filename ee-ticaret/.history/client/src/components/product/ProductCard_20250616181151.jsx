// src/components/product/ProductCard.jsx
import React, { useState, useContext } from 'react';
import { Card, Button, Toast, ToastContainer } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { CartContext } from '../common/CartContext';

const categorySlugMap = {
  electronics: { tr: 'elektronik', en: 'electronics' },
  fashion:     { tr: 'moda',       en: 'fashion' },
  books:       { tr: 'kitaplar',   en: 'books' },
  sports:      { tr: 'spor',       en: 'sports' },
  home_office: { tr: 'ev_ofis',    en: 'home_office' }
};

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

  // Lokalize edilmiş ürün adı ve açıklaması
  const localized = product.translations?.[currentLanguage] || {};
  const name = localized.name || product.name || 'Unnamed';
  const description = localized.description || product.description || '';

  // Lokalize fiyat biçimlendirme
  const formattedPrice = new Intl.NumberFormat(
    currentLanguage === 'tr' ? 'tr-TR' : 'en-US',
    {
      style: 'currency',
      currency: currentLanguage === 'tr' ? 'TRY' : 'USD',
    }
  ).format(product.price || 0);

  // Lokalize kategori slug'ı
  const localizedSlug = categorySlugMap[product.category_key]?.[currentLanguage] || product.category_key;
if (!validCategories.includes(category)) {
  return <Navigate to="/tr/404" replace />;
}
  return (
    
    <>
    
      <Card className="h-100 shadow-sm">
        <Link
          to={`/${currentLanguage}/${localizedSlug}/${product._id}`}
          className="text-decoration-none text-dark"
        >
          <Card.Img
            variant="top"
            src={product.image}
            alt={name}
            style={{ aspectRatio: '3/2', objectFit: 'cover' }}
          />
          <Card.Body className="d-flex flex-column">
            <Card.Title className="mb-2 h5">{name}</Card.Title>
            <Card.Text className="text-muted small flex-grow-1" title={description}>
              {description.length > 100
                ? `${description.substring(0, 97)}...`
                : description}
            </Card.Text>
          </Card.Body>
        </Link>

        <div className="px-3 pb-3">
          <p className="h5 text-primary fw-bold my-2">{formattedPrice}</p>
          <Button variant="danger" className="w-100" onClick={handleAddToCart}>
            <FaShoppingCart className="me-2" />
            {t('add_to_cart')}
          </Button>
        </div>
      </Card>

      {/* Sepete eklendi Toast bildirimi */}
      <ToastContainer
        className="position-fixed p-3"
        style={{
          top: '72px',
          right: '1rem',
          zIndex: 1056
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
            ✅ {currentLanguage === 'tr' ? 'Ürün sepete eklendi!' : 'Product added to cart!'}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default ProductCard;
