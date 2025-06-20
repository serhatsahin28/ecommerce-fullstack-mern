import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, Spinner, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductList from '../components/product/ProductList';
import './HomeBody.css';

// Kategori slug eşlemeleri (hem tr hem en için)
const categorySlugMap = {
  electronics: { tr: 'elektronik', en: 'electronics' },
  fashion:     { tr: 'moda',       en: 'fashion' },
  books:       { tr: 'kitaplar',   en: 'books' },
  sports:      { tr: 'spor',       en: 'sports' },
  home_office: { tr: 'ev_ofis',    en: 'home_office' }
};

// Dil ve key'e göre slug üret
const getLocalizedSlug = (categoryKey, lang) =>
  categorySlugMap[categoryKey]?.[lang] || categoryKey;

export default function HomeBody() {
  const { t, i18n } = useTranslation(['home', 'common', 'products', 'categories']);
  const lang = i18n.language;
  const [isLoading, setIsLoading] = useState(true);
  const [allItems, setAllItems] = useState([]);

  const heroSlides = t('heroSlides', { returnObjects: true }) || [];
  const banner = t('banner', { returnObjects: true }) || {};
  const advantages = t('advantages', { returnObjects: true }) || [];
  const stats = t('stats', { returnObjects: true }) || [];

  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => {
        setAllItems(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Ürünler alınamadı:", err);
        setIsLoading(false);
      });
  }, []);

  const bestSellers = useMemo(() =>
    [...allItems].sort((a, b) => b.rating - a.rating).slice(0, 4),
  [allItems]);

  const featured = useMemo(() =>
    [...allItems].filter(p =>
      p.tags?.includes('new') ||
      p.translations?.[lang]?.tags?.includes('new')
    ).slice(0, 4),
  [allItems, lang]);

  const groupedByCategory = useMemo(() => {
    const grouped = {};
    for (const item of allItems) {
      if (!grouped[item.category_key]) grouped[item.category_key] = [];
      grouped[item.category_key].push(item);
    }
    return grouped;
  }, [allItems]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  return (
    <div className="bg-home">
      {/* HERO SLIDES */}
      {heroSlides.length > 0 && (
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

      {/* Banner */}
      {banner.title && (
        <section className="promo-banner my-4 text-center rounded-4 shadow-sm">
          <h3 className="fw-bold mb-1">{banner.title}</h3>
          <p className="mb-2">{banner.desc}</p>
          <Button variant="danger" size="md" href={banner.cta_link}>
            {banner.cta}
          </Button>
        </section>
      )}

      {/* Avantajlar */}
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

      {/* İstatistikler */}
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

      {/* Ürün Listeleri */}
      <Container className="py-5">
        <header className="text-center mb-5">
          <h1 className="display-5 fw-bold text-danger">{t('page_title')}</h1>
          <p className="lead text-muted">{t('page_subtitle')}</p>
        </header>

        {/* Öne çıkan ürünler */}
        {featured.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 mb-4 section-title"><span>✨</span> {t('featured_products')}</h2>
            <div className="featured-bg rounded-4 shadow-sm p-3">
              <ProductList products={featured} lang={lang} />
            </div>
          </section>
        )}

        {/* En çok satanlar */}
        {bestSellers.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 mb-4 section-title"><span>🔥</span> {t('best_sellers')}</h2>
            <div className="bestseller-bg rounded-4 shadow-sm p-3">
              <ProductList products={bestSellers} lang={lang} />
            </div>
          </section>
        )}

        {/* Kategorilere göre */}
        {Object.entries(groupedByCategory).map(([categoryKey, products]) => (
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
              <ProductList products={products.slice(0, 4)} lang={lang} />
            </div>
          </section>
        ))}
      </Container>
    </div>
  );
}
