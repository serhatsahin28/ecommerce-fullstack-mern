// src/pages/HomeBody.js

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, Spinner, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductList from '../components/product/ProductList';
import './HomeBody.css';

// Bu kısım URL üretmek için hala geçerli ve doğru çalışıyor.
const categorySlugMap = {
  electronics: { tr: 'elektronik', en: 'electronics' },
  fashion: { tr: 'moda', en: 'fashion' },
  books: { tr: 'kitaplar', en: 'books' },
  sports: { tr: 'spor', en: 'sports' },
  home_office: { tr: 'ev-ofis', en: 'home-office' }
};

const getLocalizedSlug = (categoryKey, lang) =>
  categorySlugMap[categoryKey]?.[lang] || categoryKey;

export default function HomeBody() {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'tr'; // Fallback olarak 'tr' kullan

  // --- YENİ STATE YAPISI ---
  // API'den gelen tek ve tüm dilleri içeren objeyi burada tutacağız.
  const [homeContent, setHomeContent] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  // --- GÜNCELLENMİŞ VERİ ÇEKME ---
  useEffect(() => {
    // Admin panelde kullanılan endpoint ile aynı endpoint'e istek atıyoruz.
    // Public bir endpoint'iniz varsa (ör: /api/home) onu kullanabilirsiniz.
    fetch('http://localhost:5000/admin/homeList') 
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        // Gelen verinin `homeData` dizisinin ilk elemanını state'e atıyoruz.
        if (data && data.homeData && data.homeData.length > 0) {
          setHomeContent(data.homeData[0]);
        } else {
          setHomeContent(null); // Veri gelmezse null olarak ayarla
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Anasayfa verisi alınamadı:", err);
        setHomeContent(null);
        setIsLoading(false);
      });
  }, []); // Sadece bir kez çalışır

  // `pageData` memo'su kaldırıldı, çünkü artık tek bir veri kaynağımız var: `homeContent`

  // --- ÜRÜN LİSTELERİ İÇİN MEMO'LAR GÜNCELLENDİ ---
  // Artık `homeContent` state'ini kullanıyorlar.
  const allProducts = useMemo(() => {
    // homeContent veya categories yoksa boş dizi dön
    return homeContent?.categories?.flatMap(category => category.products || []) || [];
  }, [homeContent]);
  
  const bestSellers = useMemo(() =>
    [...allProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
    [allProducts]
  );
  
  // Öne çıkanlar: Admin panelde kategoriye eklenen ürünlerin hepsi
const featured = useMemo(() => {
  const featuredProductMap = new Map();

  (homeContent?.categories || []).forEach(category => {
    const categoryKey = category.category_key;
    const categoryTitle = category.title?.[lang] || categoryKey;

    (category.products || []).forEach(product => {
      if (!featuredProductMap.has(product._id)) {
        featuredProductMap.set(product._id, {
          ...product,
          category_key: categoryKey,
          category_title: categoryTitle
        });
      }
    });
  });
console.log(category_key);
  return Array.from(featuredProductMap.values()).slice(0, 8);
}, [homeContent, lang]);

  // --- YÜKLEME VE HATA KONTROLLERİ GÜNCELLENDİ ---
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="danger" />
        {/* Yükleme metnini de dilden alabiliriz */}
        <span className="ms-3">{homeContent?.loading?.[lang] || 'Yükleniyor...'}</span>
      </div>
    );
  }

  // Veri hiç yüklenemediyse veya boşsa gösterilecek mesaj
  if (!homeContent) {
    return (
        <div className="text-center" style={{ minHeight: '80vh', paddingTop: '10rem' }}>
            <h2>Veri Bulunamadı</h2>
            <p>Ana sayfa içeriği yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
        </div>
    );
  }

  // --- JSX RENDER ---
  // Tüm metin alanları `homeContent.alanAdi?.[lang]` yapısıyla güncellendi.
  return (
    <div className="bg-home">
      {/* HERO SLIDES */}
      {homeContent.heroSlides?.length > 0 && (
        <section className="home-hero">
          <Carousel fade indicators={true} className="mb-0">
            {homeContent.heroSlides.map((slide, index) => (
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
                    <h1 className="display-4 fw-bold mb-3">{slide.title?.[lang]}</h1>
                    <p className="lead mb-4">{slide.subtitle?.[lang]}</p>
                    <Button variant="light" size="lg" as={Link} to={slide.cta_link?.[lang]} className="px-4">
                      {slide.cta?.[lang]}
                    </Button>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </section>
      )}

      {/* Banner */}
      {homeContent.banner?.title?.[lang] && (
        <Container>
            <section className="promo-banner my-5 text-center rounded-4 shadow-sm p-4 bg-light">
                <h3 className="fw-bold mb-1">{homeContent.banner.title?.[lang]}</h3>
                <p className="mb-3">{homeContent.banner.desc?.[lang]}</p>
                <Button variant="danger" size="md" as={Link} to={homeContent.banner.cta_link?.[lang]}>
                {homeContent.banner.cta?.[lang]}
                </Button>
            </section>
        </Container>
      )}

      {/* Avantajlar */}
      {homeContent.advantages?.length > 0 && (
        <section className="features-bar d-flex justify-content-center gap-5 py-4 mb-4 flex-wrap">
          {homeContent.advantages.map((adv, i) => (
            <div className="feature-item text-center d-flex align-items-center gap-3" key={i}>
              <span style={{ fontSize: "2.5rem" }}>{adv.icon}</span>
              <span className='fw-medium'>{adv.text?.[lang]}</span>
            </div>
          ))}
        </section>
      )}

      {/* İstatistikler */}
      {homeContent.stats?.length > 0 && (
        <section className="site-stats my-5 d-flex justify-content-center gap-5">
          {homeContent.stats.map((stat, i) => (
            <div className="stat-item text-center" key={i}>
              <div className="fs-2 fw-bold text-danger">{stat.value}</div>
              <div className="small text-muted">{stat.desc?.[lang]}</div>
            </div>
          ))}
        </section>
      )}

      {/* Ürün Listeleri */}
      <Container className="py-5">
        <header className="text-center mb-5">
          <h1 className="display-5 fw-bold text-danger">{homeContent.page_title?.[lang]}</h1>
          <p className="lead text-muted">{homeContent.page_subtitle?.[lang]}</p>
        </header>

        {/* Öne çıkan ürünler */}
        {featured.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 mb-4 section-title"><span>✨</span> {homeContent.featured_products?.[lang]}</h2>
            <div className="featured-bg rounded-4 shadow-sm p-3">
              {/* ProductList bileşeni `lang` prop'u ile zaten dile göre ürün ismini vs. gösteriyordur */}
              <ProductList products={featured} lang={lang} />
            </div>
          </section>
        )}

        {/* En çok satanlar */}
        {bestSellers.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 mb-4 section-title"><span>🔥</span> {homeContent.best_sellers?.[lang]}</h2>
            <div className="bestseller-bg rounded-4 shadow-sm p-3">
              <ProductList products={bestSellers} lang={lang} />
            </div>
          </section>
        )}

        {/* Kategorilere göre (bu bölümü isteğe bağlı olarak kaldırabilirsiniz, çünkü "öne çıkanlar" zaten bunu kapsıyor) */}
        {homeContent.categories?.map((category) => (
          (category.products && category.products.length > 0) && (
            <section className="mb-5" key={category.category_key}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 text-capitalize mb-0 d-flex align-items-center gap-2">
                  <span className={`category-icon icon-${category.category_key}`}></span>
                  {category.title?.[lang]}
                </h2>
                <Button
                  as={Link}
                  to={`/${lang}/${getLocalizedSlug(category.category_key, lang)}`}
                  variant="outline-danger"
                  size="sm"
                >
                  {homeContent.view_all?.[lang]}
                </Button>
              </div>
              <div className="category-list-bg rounded-3 p-2">
                <ProductList products={category.products.slice(0, 4)} lang={lang} />
              </div>
            </section>
          )
        ))}
      </Container>
    </div>
  );
}