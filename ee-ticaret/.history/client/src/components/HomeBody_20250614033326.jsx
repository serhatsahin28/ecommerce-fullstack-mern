import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, Spinner, Carousel, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductList from '../components/product/ProductList';
import './HomeBody.css';

const categorySlugMap = {
  electronics: { tr: 'elektronik', en: 'electronics' },
  fashion:     { tr: 'moda',       en: 'fashion' },
  books:       { tr: 'kitaplar',   en: 'books' },
  sports:      { tr: 'spor',       en: 'sports' },
  home_office: { tr: 'ev_ofis',    en: 'home_office' }
};

const getLocalizedSlug = (categoryKey, lang) =>
  categorySlugMap[categoryKey]?.[lang] || categoryKey;

export default function HomeBody() {
  const { t, i18n } = useTranslation(['home', 'common', 'products', 'categories']);
  const lang = i18n.language;
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // API'den ürünleri çek
  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => {
        console.error('Veri alınırken hata oluştu:', err);
        setProducts([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Kategorilere göre grupla
  const groupedByCategory = useMemo(() => {
    const grouped = {};
    for (const item of products) {
      const key = item.category_key;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    }
    return grouped;
  }, [products]);

  // Çok satanlar ve öne çıkanlar
  const bestSellers = useMemo(() => [...products].sort((a, b) => b.rating - a.rating).slice(0, 4), [products]);
  const featured = useMemo(() => products.filter(p => p.translations?.[lang]?.features?.includes('new')).slice(0, 4), [products]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  if (!products.length) {
    return <Alert variant="warning">{t('no_products_found', { ns: 'products' })}</Alert>;
  }

  return (
    <div className="bg-home">
      <Container className="py-5">
        <header className="text-center mb-5">
          <h1 className="display-5 fw-bold text-danger">{t('page_title')}</h1>
          <p className="lead text-muted">{t('page_subtitle')}</p>
        </header>

        {/* Öne Çıkanlar */}
        {featured.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 mb-4 section-title"><span>✨</span> {t('featured_products')}</h2>
            <div className="featured-bg rounded-4 shadow-sm p-3">
              <ProductList products={featured} />
            </div>
          </section>
        )}

        {/* Çok Satanlar */}
        {bestSellers.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 mb-4 section-title"><span>🔥</span> {t('best_sellers')}</h2>
            <div className="bestseller-bg rounded-4 shadow-sm p-3">
              <ProductList products={bestSellers} />
            </div>
          </section>
        )}

        {/* Kategorilere Göre Ürünler */}
        {Object.entries(groupedByCategory).map(([categoryKey, categoryProducts]) => (
          <section className="mb-5" key={categoryKey}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 text-capitalize mb-0 d-flex align-items-center gap-2">
                <span className={`category-icon icon-${categoryKey}`}></span>
                {t(`categories.${categoryKey}`, { ns: 'categories' })}
              </h2>
              <Button
                as={Link}
                to={`/${lang}/${getLocalizedSlug(categoryKey, lang)}`}
                variant="outline-danger"
                size="sm"
              >
                {t('view_all')}
              </Button>
            </div>
            <div className="category-list-bg rounded-3 p-2">
              <ProductList products={categoryProducts.slice(0, 4)} />
            </div>
          </section>
        ))}
      </Container>
    </div>
  );
}
