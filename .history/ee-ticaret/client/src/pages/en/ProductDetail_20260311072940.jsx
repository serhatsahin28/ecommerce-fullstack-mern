import React, { useEffect, useState, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Container, Row, Col, Image, Button, Badge, Modal, Toast
} from 'react-bootstrap';
import {
  FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight, FaCheck
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../components/common/CartContext';

const normalize = str =>
  str?.toLowerCase().replace(/[\s\-]+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const slugToCategoryKey = {
  'elektronik': 'electronics', 'moda': 'fashion', 'kitaplar': 'books',
  'spor': 'sports', 'ev_ofis': 'home_office', 'electronics': 'electronics',
  'fashion': 'fashion', 'books': 'books', 'sports': 'sports', 'home_office': 'home_office',
};

export default function ProductDetail() {
  const { id, category: rawCategory } = useParams();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  const normalizedSlug = normalize(rawCategory);
  const expectedCategoryKey = slugToCategoryKey[normalizedSlug];
  const baseUrl = "http://${import.meta.env.VITE_API_URL}";

  useEffect(() => {
    if (!expectedCategoryKey) { setNotFound(true); return; }

    fetch(`http://${import.meta.env.VITE_API_URL}/admin/productsList`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => {
          const pId = p._id?.$oid || p._id; 
          return pId === id;
        });

        if (!found || found.category_key !== expectedCategoryKey) {
          setNotFound(true);
        } else {
          setProduct(found);
          if (found.hasVariants && found.variants?.length > 0) {
            setSelectedVariant(found.variants[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id, expectedCategoryKey]);

  if (notFound) return <Navigate to={`/${currentLang}/404`} replace />;
  if (loading) return <Container className="py-5 text-center"><h4>{currentLang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</h4></Container>;
  if (!product) return null;

  const tData = product.translations?.[currentLang] || {};

  // Galeri Yönetimi: images alanın yok, extraImages ve image alanın var.
  const currentGallery = (selectedVariant && selectedVariant.images?.length > 0)
    ? selectedVariant.images
    : [product.image, ...(product.extraImages || [])].filter(Boolean);

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      cartId: selectedVariant ? `${product._id}-${selectedVariant.variant_id}` : product._id,
      name: tData.name,
      price: displayPrice,
      selectedVariant: selectedVariant,
      image: currentGallery[0]
    };
    addToCart(cartItem);
    setShowToast(true);
  };

  return (
    <>
      <Toast
        show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide bg="success"
        style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: '300px' }}
      >
        <Toast.Body className="text-white d-flex align-items-center">
          <FaCheck className="me-2" /> {currentLang === 'tr' ? 'Ürün sepete eklendi!' : 'Item added to cart!'}
        </Toast.Body>
      </Toast>

     
    </>
  );
}