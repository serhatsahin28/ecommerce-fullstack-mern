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
  home_office: { tr: 'ev-ofis',    en: 'home_office' } // tireli daha URL dostu
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
  const name = localized.name || 'İsimsiz Ürün';
  const description = localized.description || '';

  const formattedPrice = new Intl.NumberFormat(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    {
      style: 'currency',
      currency: lang === 'tr' ? 'TRY' : 'USD',
    }
  ).format(product.price || 0);

  // Bu satırı zaten tanımlamıştın ama Link içinde kullanmıyordun. Şimdi kullanacağız.
  // Not: Artık buna gerek kalmadı, çünkü doğrudan Link içinde çevireceğiz. Silebiliriz.
  // const localizedSlug = categorySlugMap[product.category_key]?.[lang] || product.category_key;

  return (
    <>
      <Card className="h-100 shadow-sm d-flex flex-column">
    
        <Link
          // `product.category_key`'i `categorySlugMap` kullanarak doğru dile çeviriyoruz.
          // Eğer haritada bir karşılığı yoksa, yine `category_key`'in kendisini kullanır (güvenlik için).
          to={`/${lang}/${categorySlugMap[product.category_key]?.[lang] || product.category_key}/${product.product_id}`}
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
              {/* İstersen Kategori Adını Burada da Gösterebilirsin */}
              {product.category_title && <Card.Subtitle className="mb-2 text-muted small">{product.category_title}</Card.Subtitle>}
              
              <Card.Title className="mb-2 fs-6 fw-bold text-truncate" title={name}>
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
          <Button variant="primary" className="w-100" onClick={handleAddToCart}>
            <FaShoppingCart className="me-2" />
            {lang === 'tr' ? 'Sepete Ekle' : 'Add to Cart'}
          </Button>
        </div>
      </Card>

      {/* ToastContainer kısmı aynı kalabilir... */}
      <ToastContainer className="position-fixed p-3" style={{ top: '72px', right: '1rem', zIndex: 1056 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} bg="success" delay={2000} autohide animation>
          <Toast.Body className="text-white small"> ✅ {lang === 'tr' ? 'Ürün sepete eklendi!' : 'Product added to cart!'} </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default ProductCard;