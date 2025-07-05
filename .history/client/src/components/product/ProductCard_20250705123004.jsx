import React, { useState, useContext } from 'react';
import { Card, Button, Toast, ToastContainer } from 'react-bootstrap';
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

const ProductCard = ({ product, lang = 'en' }) => {
  const { addToCart } = useContext(CartContext);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const localized = product.translations?.[lang] || {};
  const name = localized.name || product.name || 'Unnamed';
  const description = localized.description || product.description || '';

  const formattedPrice = new Intl.NumberFormat(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    {
      style: 'currency',
      currency: lang === 'tr' ? 'TRY' : 'USD',
    }
  ).format(product.price || 0);

  const localizedSlug = categorySlugMap[product.category_key]?.[lang] || product.category_key;



  return (
    <>
      <Card className="h-100 shadow-sm d-flex flex-column">
        <Link
          to={`/${lang}/${category.category_key}/${product.product_id}`}
          className="text-decoration-none text-dark"
        >
          <Card.Img
            variant="top"
            src={product.image}
            alt={name}
            style={{
              objectFit: 'cover',
              width: '100%',
              aspectRatio: '4 / 3',
            }}
          />
          <Card.Body className="d-flex flex-column justify-content-between">
            <div>
              <Card.Title className="mb-2 fs-6 fw-bold text-truncate" title={name}>
                {name}
              </Card.Title>
              <Card.Text
                className="text-muted small"
                style={{
                  minHeight: '3.5em',
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
          <p className="h6 text-primary fw-semibold my-2">{formattedPrice}</p>
          <Button variant="danger" className="w-100" onClick={handleAddToCart}>
            <FaShoppingCart className="me-2" />
            {lang === 'tr' ? 'Sepete Ekle' : 'Add to Cart'}
          </Button>
        </div>
      </Card>

      <ToastContainer
        className="position-fixed p-3"
        style={{
          top: '72px',
          right: '1rem',
          zIndex: 1056,
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
            ✅ {lang === 'tr' ? 'Ürün sepete eklendi!' : 'Product added to cart!'}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default ProductCard;
