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
  const lang = i18n.language || 'tr';

  const [homeContent, setHomeContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/admin/homeList')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data && data.homeData && data.homeData.length > 0) {
          setHomeContent(data.homeData[0]);
        } else {
          setHomeContent(null);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Anasayfa verisi alınamadı:", err);
        setHomeContent(null);
        setIsLoading(false);
      });
  }, []);


  // --- ÜRÜN LİSTELERİ İÇİN MEMO'LAR GÜNCELLENDİ ---

  // *** 1. KRİTİK DEĞİŞİKLİK BURADA ***
  // Tüm ürünleri toplarken, her ürüne kendi kategori anahtarını ekliyoruz.
  const allProducts = useMemo(() => {
    if (!homeContent?.categories) return [];
    
    return homeContent.categories.flatMap(category => 
      // Her ürün için yeni bir obje oluşturup category_key'i içine ekliyoruz.
      (category.products || []).map(product => ({
        ...product,
        category_key: category.category_key 
      }))
    );
  }, [homeContent]);

  // 'allProducts' artık 'category_key' içerdiği için bu kısım otomatik olarak doğru çalışacak.
  const bestSellers = useMemo(() =>
    [...allProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
    [allProducts]
  );
  
  // Öne çıkanlar listesi de artık doğru şekilde 'category_key' içerecek.
  const featured = useMemo(() => {
      // Tekrarlı ürünleri engellemek için Map kullanıyoruz
      const featuredProductMap = new Map();
      allProducts.forEach(product => {
          if (!featuredProductMap.has(product.product_id)) {
              featuredProductMap.set(product.product_id, product);
          }
      });
      return Array.from(featuredProductMap.values()).slice(0, 8);
  }, [allProducts]);
  

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="danger" />
        <span className="ms-3">{homeContent?.loading?.[lang] || 'Yükleniyor...'}</span>
      </div>
    );
  }

  if (!homeContent) {
    return (
        <div className="text-center" style={{ minHeight: '80vh', paddingTop: '10rem' }}>
            <h2>Veri Bulunamadı</h2>
            <p>Ana sayfa içeriği yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
        </div>
    );
  }

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
                  style={{ backgroundImage: `linear-gradient(rgba(32,32,32,0.50), rgba(32,32,32,0.55)), url(${slide.image})` }}
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

      {/* Avantajlar & İstatistikler */}
      <section className='container my-5'>
          <div className="d-flex justify-content-around flex-wrap gap-4 text-center">
            {homeContent.advantages?.map((adv, i) => (
                <div className="feature-item d-flex flex-column align-items-center" key={`adv-${i}`}>
                    <span style={{ fontSize: "2.5rem" }}>{adv.icon}</span>
                    <span className='fw-medium mt-2'>{adv.text?.[lang]}</span>
                </div>
            ))}
            {homeContent.stats?.map((stat, i) => (
                <div className="stat-item d-flex flex-column align-items-center" key={`stat-${i}`}>
                    <div className="fs-2 fw-bold text-danger">{stat.value}</div>
                    <div className="small text-muted">{stat.desc?.[lang]}</div>
                </div>
            ))}
          </div>
      </section>

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

        {/* Kategorilere göre */}
        {homeContent.categories?.map((category) => (
          (category.products && category.products.length > 0) && (
            <section className="mb-5" key={category.category_key}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 text-capitalize mb-0 d-flex align-items-center gap-2">
                  <span className={`category-icon icon-${category.category_key}`}></span>
                  {category.title?.[lang]}
                </h2>
                <Button as={Link} to={`/${lang}/${getLocalizedSlug(category.category_key, lang)}`} variant="outline-danger" size="sm" >
                  {homeContent.view_all?.[lang]}
                </Button>
              </div>
              <div className="category-list-bg rounded-3 p-2">
                {/* *** 2. KRİTİK DEĞİŞİKLİK BURADA *** */}
                {/* Buradaki ürünlere de kategori anahtarını ekliyoruz. */}
                <ProductList
                    products={category.products.slice(0, 4).map(p => ({
                        ...p,
                        category_key: category.category_key,
                    }))}
                    lang={lang}
                />
              </div>
            </section>
          )
        ))}
      </Container>
    </div>
  );
}