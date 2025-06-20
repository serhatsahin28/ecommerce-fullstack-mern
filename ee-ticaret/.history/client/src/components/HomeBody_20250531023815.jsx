// src/pages/en/HomeBody.jsx veya src/pages/tr/HomeBody.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, Spinner, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductList from '../components/product/ProductList';
import './HomeBody.css';

export default function HomeBody() {
  const { t, i18n } = useTranslation(['home', 'common', 'products']);
  const lang = i18n.language;
  const [isLoading, setIsLoading] = useState(true);

  // Ürünler ve kategoriler
  const allItems = useMemo(() => t('items', { returnObjects: true, ns: 'products' }) || [], [t]);

  const bestSellers = useMemo(() => [...allItems].sort((a, b) => b.rating - a.rating).slice(0, 4), [allItems]);
  const featured = useMemo(() => [...allItems].filter(p => p.tags?.includes('new')).slice(0, 4), [allItems]);
  const groupedByCategory = useMemo(() => {
    const grouped = {};
    for (const item of allItems) {
      if (!grouped[item.category_key]) grouped[item.category_key] = [];
      grouped[item.category_key].push(item);
    }
    return grouped;
  }, [allItems]);

  // JSON'dan gelen yeni alanlar
  const heroSlides = t('heroSlides', { returnObjects: true }) || [];
  const banner = t('banner', { returnObjects: true }) || {};
  const advantages = t('advantages', { returnObjects: true }) || [];
  const stats = t('stats', { returnObjects: true }) || [];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  return (
    <div className="bg-home">
      {/* HERO SECTION */}
      {Array.isArray(heroSlides) && heroSlides.length > 0 && (
        <section className="home-hero">
          <Carousel fade indicators={false} className="mb-0">
            {heroSlides.map((slide, index) => (
              <Carousel.Item key={index} interval={5000}>
                <div
                  className="hero-slide d-flex align-items-center justify-content-center text-white text-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(32,32,32,0.50), rgba(32,32,32,0.55)), url(${slide.image})`,
                    height: '560px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="hero-content rounded-4 shadow-lg p-4 px-5" style={{ background: 'rgba(0,0,0,0.40)' }}>
                    <h1 className="display-4 fw-bold mb-3">{slide.title}</h1>
                    <p className="lead mb-4">{slide.subtitle}</p>
                    <Button variant="light" size="lg" href={slide.cta_link} className="px-4">
                      {slide.cta}
                    </Button>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </section>
      )}

      {/* BANNER / KAMPANYA */}
      {banner.title && (
        <section className="promo-banner my-4 text-center rounded-4 shadow-sm">
          <h3 className="fw-bold mb-1">{banner.title}</h3>
          <p className="mb-2">{banner.desc}</p>
          <Button variant="danger" size="md" href={banner.cta_link}>
            {banner.cta}
          </Button>
        </section>
      )}

      {/* AVANTAJLAR */}
      {advantages.length > 0 && (
        <section className="features-bar d-flex justify-content-center gap-4 py-3 mb-5 flex-wrap">
          {advantages.map((adv, i) => (
            <div className="feature-item text-center" key={i}>
              <span style={{ fontSize: "2rem" }}>{adv.icon}</span>
              <div>{adv.text}</div>
            </div>
          ))}
        </section>
      )}

      {/* İSTATİSTİKLER */}
      {stats.length > 0 && (
        <section className="site-stats my-4 d-flex justify-content-center gap-5">
          {stats.map((stat, i) => (
            <div className="stat-item text-center" key={i}>
              <div className="fs-2 fw-bold text-danger">{stat.value}</div>
              <div className="small text-muted">{stat.desc}</div>
            </div>
          ))}
        </section>
      )}

      <Container className="py-5">
        {/* Sayfa Başlığı */}
        <header className="text-center mb-5">
          <h1 className="display-5 fw-bold text-danger">{t('page_title')}</h1>
          <p className="lead text-muted">{t('page_subtitle')}</p>
        </header>

        {/* Öne Çıkan Ürünler */}
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

        {/* Kategoriye Göre Ürünler */}
        {Object.entries(groupedByCategory).map(([categoryKey, products]) => (
          <section className="mb-5" key={categoryKey}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 text-capitalize mb-0 d-flex align-items-center gap-2">
                <span className={`category-icon icon-${categoryKey}`}></span>
                {t(`categories.${categoryKey}`, { ns: 'categories' })}
              </h2>
              <Button
                as={Link}
                to={`/${lang}/${categoryKey}`}
                variant="outline-danger"
                size="sm"
              >
                {t('view_all')}
              </Button>
            </div>
            <div className="category-list-bg rounded-3 p-2">
              <ProductList products={products.slice(0, 4)} />
            </div>
          </section>
        ))}
      </Container>
    </div>
  );
}
