// src/pages/HomeBody.js

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, Spinner, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductList from '../components/product/ProductList';
import './HomeBody.css';

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


  const allFeaturedProductsPool = useMemo(() => {
    if (!homeContent?.categories) return [];
    const allProducts = homeContent.categories.flatMap(category =>
      (category.products || [])
        .filter(product => (product.stock ?? 0) > 0) // 👈 STOK KONTROLÜ
        
        .map(product => ({
          ...product,
          category_key: category.category_key,
          category_title: category.title?.[lang] || category.category_key
        }))
    );

    const uniqueProducts = new Map();
    allProducts.forEach(p => {
      if (!uniqueProducts.has(p.product_id)) {
        uniqueProducts.set(p.product_id, p);
      }
    });

    return Array.from(uniqueProducts.values());
  }, [homeContent, lang]);


  // 2. ADIM: "Öne Çıkanlar" İçin Rastgele 4 ÜRÜN SEÇ
  // Fisher-Yates shuffle algoritması ile havuzdaki ürünleri karıştırıp ilk 4 tanesini alıyoruz.
  const randomFeaturedProducts = useMemo(() => {
    // Havuzun kopyasını alarak orijinal diziyi bozmuyoruz.
    const shuffled = [...allFeaturedProductsPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Elemanları yer değiştir
    }
    return shuffled.slice(0, 4); // Karıştırılmış dizinin ilk 4 elemanını al
  }, [allFeaturedProductsPool]);

  // 3. ADIM: "Çok Satanlar" İçin Stoğu En Az Olan 4 ÜRÜNÜ SEÇ
  const lowStockProducts = useMemo(() => {
    // stoğu küçükten büyüğe sırala ve ilk 4'ünü al.
    return [...allFeaturedProductsPool]
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 4);
  }, [allFeaturedProductsPool]);

  // ==========================================================

  if (isLoading) { /* Yükleme durumu aynı */ return (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}> <Spinner animation="border" variant="danger" /> <span className="ms-3">{homeContent?.loading?.[lang] || 'Yükleniyor...'}</span> </div>); }
  if (!homeContent) { /* Hata durumu aynı */ return (<div className="text-center" style={{ minHeight: '80vh', paddingTop: '10rem' }}> <h2>Veri Bulunamadı</h2> <p>Ana sayfa içeriği yüklenemedi. Lütfen daha sonra tekrar deneyin.</p> </div>); }


  return (
    <div className="bg-home">
      {/* 
        SAYFA ÜSTÜ (HERO, BANNER, AVANTAJLAR, İSTATİSTİKLER)
        Bu kısımlarda bir değişiklik yok.
      */}
      {homeContent.heroSlides?.length > 0 && (<section className="home-hero"> <Carousel fade indicators={true} className="mb-0"> {homeContent.heroSlides.map((slide, index) => (<Carousel.Item key={index} interval={5000}> <div className="hero-slide d-flex align-items-center justify-content-center text-white text-center" style={{ backgroundImage: `linear-gradient(rgba(32,32,32,0.50), rgba(32,32,32,0.55)), url(${slide.image})`, height: '560px', backgroundSize: 'cover', backgroundPosition: 'center' }}> <div className="hero-content rounded-4 shadow-lg p-4 px-5" style={{ background: 'rgba(0,0,0,0.40)' }}> <h1 className="display-4 fw-bold mb-3">{slide.title?.[lang]}</h1> <p className="lead mb-4">{slide.subtitle?.[lang]}</p> <Button variant="light" size="lg" as={Link} to={slide.cta_link?.[lang]} className="px-4"> {slide.cta?.[lang]} </Button> </div> </div> </Carousel.Item>))} </Carousel> </section>)}
      {homeContent.banner?.title?.[lang] && (<Container> <section className="promo-banner my-5 text-center rounded-4 shadow-sm p-4 bg-light"> <h3 className="fw-bold mb-1">{homeContent.banner.title?.[lang]}</h3> <p className="mb-3">{homeContent.banner.desc?.[lang]}</p> <Button variant="danger" size="md" as={Link} to={homeContent.banner.cta_link?.[lang]}> {homeContent.banner.cta?.[lang]} </Button> </section> </Container>)}
      {homeContent.advantages?.length > 0 && (<section className="features-bar d-flex justify-content-center gap-5 py-4 mb-4 flex-wrap"> {homeContent.advantages.map((adv, i) => (<div className="feature-item text-center d-flex align-items-center gap-3" key={i}> <span style={{ fontSize: "2.5rem" }}>{adv.icon}</span> <span className='fw-medium'>{adv.text?.[lang]}</span> </div>))} </section>)}
      {homeContent.stats?.length > 0 && (<section className="site-stats my-5 d-flex justify-content-center gap-5"> {homeContent.stats.map((stat, i) => (<div className="stat-item text-center" key={i}> <div className="fs-2 fw-bold text-danger">{stat.value}</div> <div className="small text-muted">{stat.desc?.[lang]}</div> </div>))} </section>)}

      <Container className="py-5">
        <header className="text-center mb-5">
          <h1 className="display-5 fw-bold text-danger">{homeContent.page_title?.[lang]}</h1>
          <p className="lead text-muted">{homeContent.page_subtitle?.[lang]}</p>
        </header>

        {/* --- Bölüm 1: Öne Çıkanlar (Rastgele) --- */}
        {randomFeaturedProducts.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 mb-4 section-title"><span>✨</span> {homeContent.featured_products?.[lang]}</h2>
            <div className="featured-bg rounded-4 shadow-sm p-3">
              <ProductList products={randomFeaturedProducts} lang={lang} />
            </div>
          </section>
        )}

        {/* --- Bölüm 2: Çok Satanlar (Stoğu Azalanlar) --- */}
        {lowStockProducts.length > 0 && (
          <section className="mb-5">
            {/* 
              İkonu ve başlığı yeni anlama uygun hale getirdik. 
              Başlık yine veritabanından geliyor, admin panelinden "Sınırlı Stok" gibi değiştirebilirsin.
            */}
            <h2 className="h4 mb-4 section-title"><span>⏳</span> {homeContent.best_sellers?.[lang]}</h2>
            <div className="bestseller-bg rounded-4 shadow-sm p-3">
              <ProductList products={lowStockProducts} lang={lang} />
            </div>
          </section>
        )}

        {/* --- Bölüm 3: Kategorilere Göre Listeleme (ORİJİNAL YAPIN) --- */}
        {/* Bu bölüm olduğu gibi kaldı ve doğru çalışmaya devam ediyor. */}
        {homeContent.categories?.map((category) => (
          (category.products && category.products.length > 0) && (
            <section className="mb-5" key={category.category_key}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 text-capitalize mb-0 d-flex align-items-center gap-2">
                  <span className={`category-icon icon-${category.category_key}`}></span>
                  {category.title?.[lang]}
                </h2>
                <Button as={Link} to={`/${lang}/${getLocalizedSlug(category.category_key, lang)}`} variant="outline-danger" size="sm">
                  {homeContent.view_all?.[lang]}
                </Button>
              </div>
              <div className="category-list-bg rounded-3 p-2">
                <ProductList
                  products={category.products.slice(0, 4).map(p => ({
                    ...p,
                    category_key: category.category_key,
                    category_title: category.title?.[lang]
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