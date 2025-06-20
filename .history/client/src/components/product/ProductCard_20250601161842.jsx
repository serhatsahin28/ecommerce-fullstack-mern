import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { t, i18n } = useTranslation('products');
  const currentLanguage = i18n.language;

  const formattedPrice = new Intl.NumberFormat(
    currentLanguage === 'tr' ? 'tr-TR' : 'en-US',
    {
      style: 'currency',
      currency: currentLanguage === 'tr' ? 'TRY' : 'USD',
    }
  ).format(product.price);

  return (
    <Card className="h-100 shadow-sm">
      {/* Ürün detay sayfasına yönlendiren bağlantı */}
      <Link to={`/${currentLanguage}/products/${product.id}`} className="text-decoration-none text-dark">
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
        <Button variant="danger" className="w-100">
          <FaShoppingCart className="me-2" /> {t('add_to_cart')}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
