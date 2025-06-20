import React, { useEffect, useState, useMemo } from 'react';
import { Container, Button, Spinner, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductList from '../components/product/ProductList';
import './HomeBody.css';

// Kategori slug eşlemeleri (hem tr hem en için)
const categorySlugMap = {
  electronics: { tr: 'elektronik', en: 'electronics' },
  fashion: { tr: 'moda', en: 'fashion' },
  books: { tr: 'kitaplar', en: 'books' },
  sports: { tr: 'spor', en: 'sports' },
  home_office: { tr: 'ev_ofis', en: 'home_office' }
};

// Dil ve key'e göre slug üret
const getLocalizedSlug = (categoryKey, lang) =>
  categorySlugMap[categoryKey]?.[lang] || categoryKey;

export default function HomeBody() {
  const [allPagesData, setAllPagesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa dili (örn: 'tr' veya 'en') - bunu kendi global dil yönetiminle değiştir
  const lang = navigator.language.startsWith('tr') ? 'tr' : 'en';

  useEffect(() => {
    fetch('http://localhost:5000/home')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setAllPagesData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Ürünler alınamadı:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Gelen veriler içinden aktif dil için sayfa verisi
  const pageData = allPagesData.find(p => p.page_language === lang) || allPagesData[0];

  // Yükleniyorsa spinner göster
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" variant="danger" />
        <span className="ms-2">{pageData?.loading || (lang === 'tr' ? 'Yükleniyor...' : 'Loading...')}</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-danger mt-5">Hata: {error}</div>;
  }

  if (!pageData) {
    return <div className="text-center mt-5">{lang === 'tr' ? 'Veri bulunamadı' : 'Data not found'}</div>;
  }

  // Tüm ürünleri categories içinden derle
  // const allProducts = useMemo(() => {
  //   if (!pageData.categories) return [];
  //   return pageData.categories.flatMap(cat => cat.products || []);
  // }, [pageData]);

  // En çok satanlar (rating'e göre sıralayıp ilk 4)
  const bestSellers = useMemo(() => {
    return [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 4);
  }, [allProducts]);

  // Öne çıkanlar: tags içinde 'new' olanlar (tags ürün objesinde yok, sen orijinal veriye göre uyarlayabilirsin)
  // Ancak elimizde 'tags' yok, gelen veride yok, o yüzden featured'ı rating'e göre yüksek olanlar veya son eklenenler olarak alabiliriz
  // Şimdilik rating > 4.5 olan ilk 4'ü öne çıkan kabul edelim
  const featured = useMemo(() => {
    return allProducts.filter(p => p.rating >= 4.5).slice(0, 4);
  }, [allProducts]);

  // Kategorilere göre grupla (zaten categories içinde var, orijinal başlıklar da var)
  const groupedByCategory = pageData.categories || [];

  return (
    <div className="bg-home">
      {/* HERO SLIDES */}
      {pageData.heroSlides?.length > 0 && (
        <section className="home-hero">
          <Carousel fade indicators={false} className="mb-0">
            {pageData.heroSlides.map((slide, index) => (
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
      {pageData.banner?.title && (
        <section className="promo-banner my-4 text-center rounded-4 shadow-sm">
          <h3 className="fw-bold mb-1">{pageData.banner.title}</h3>
          <p className="mb-2">{pageData.banner.desc}</p>
          <Button variant="danger" size="md" href={pageData.banner.cta_link}>
            {pageData.banner.cta}
          </Button>
        </section>
      )}

      {/* Avantajlar */}
      {pageData.advantages?.length > 0 && (
        <section className="features-bar d-flex justify-content-center gap-4 py-3 mb-5 flex-wrap">
          {pageData.advantages.map((adv, i) => (
            <div className="feature-item text-center" key={i}>
              <span style={{ fontSize: "2rem" }}>{adv.icon}</span>
              <div>{adv.text}</div>
            </div>
          ))}
        </section>
      )}

      {/* İstatistikler */}
      {pageData.stats?.length > 0 && (
        <section className="site-stats my-4 d-flex justify-content-center gap-5">
          {pageData.stats.map((stat, i) => (
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
          <h1 className="display-5 fw-bold text-danger">{pageData.page_title}</h1>
          <p className="lead text-muted">{pageData.page_subtitle}</p>
        </header>

        {/* Öne çıkan ürünler */}
        {featured.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 mb-4 section-title"><span>✨</span> {pageData.featured_products}</h2>
            <div className="featured-bg rounded-4 shadow-sm p-3">
              <ProductList products={featured} lang={lang} />
            </div>
          </section>
        )}

        {/* En çok satanlar */}
        {bestSellers.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 mb-4 section-title"><span>🔥</span> {pageData.best_sellers}</h2>
            <div className="bestseller-bg rounded-4 shadow-sm p-3">
              <ProductList products={bestSellers} lang={lang} />
            </div>
          </section>
        )}

        {/* Kategorilere göre ürünler */}
        {groupedByCategory.map(({ category_key, title, products }) => (
          <section className="mb-5" key={category_key}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 text-capitalize mb-0 d-flex align-items-center gap-2">
                <span className={`category-icon icon-${category_key}`}></span>
                {title || category_key}
              </h2>
              <Button
                as={Link}
                to={`/${lang}/${getLocalizedSlug(category_key, lang)}`}
                variant="outline-danger"
                size="sm"
              >
                {pageData.view_all || (lang === 'tr' ? 'Tümünü Gör' : 'View All')}
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
