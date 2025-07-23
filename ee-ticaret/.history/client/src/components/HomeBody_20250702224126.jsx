  // src/pages/HomeBody.js

  import React, { useEffect, useState, useMemo } from 'react';
  import { useTranslation } from 'react-i18next';
  import { Container, Button, Spinner, Carousel } from 'react-bootstrap';
  import { Link } from 'react-router-dom';
  import ProductList from '../components/product/ProductList'; // Bu bileşenin doğru yolda olduğundan emin olun
  import './HomeBody.css'; // Stil dosyanız

  // Kategori slug eşlemeleri (hem tr hem en için) - Bu yapı hala kullanışlı
  const categorySlugMap = {
    electronics: { tr: 'elektronik', en: 'electronics' },
    fashion: { tr: 'moda', en: 'fashion' },
    books: { tr: 'kitaplar', en: 'books' },
    sports: { tr: 'spor', en: 'sports' },
    home_office: { tr: 'ev-ofis', en: 'home-office' } // tire ile daha URL dostu
  };

  // Dil ve key'e göre slug üret
  const getLocalizedSlug = (categoryKey, lang) =>
    categorySlugMap[categoryKey]?.[lang] || categoryKey;

  export default function HomeBody() {
    // i18next'ten sadece aktif dili almak için kullanıyoruz
    const { i18n } = useTranslation();
    const lang = i18n.language;

    // State'ler
    const [apiData, setApiData] = useState([]); // API'den gelen tüm veriyi (TR ve EN) tutar
    const [isLoading, setIsLoading] = useState(true);

    // Veriyi API'den çekme
    useEffect(() => {
      fetch('http://localhost:5000/home')
        .then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then(data => {
          setApiData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Veri alınamadı:", err);
          setIsLoading(false); // Hata durumunda da yüklemeyi durdur
        });
    }, []); // Sadece bileşen yüklendiğinde bir kez çalışır

    // Aktif dile göre sayfa verisini seç
    // Fallback olarak ilk veriyi (genellikle 'tr') veya boş bir nesne kullanır
    const pageData = useMemo(() =>
      apiData.find(p => p.page_language === lang) || apiData.home || {},
      [apiData, lang]
    );

    // Tüm kategorilerdeki ürünleri tek bir düz listeye çıkar
    const allProducts = useMemo(() => {
      if (!pageData?.categories) return [];
      return pageData.categories.flatMap(category => category.products || []);
    }, [pageData]);

    
    // En çok satanları rating'e göre sırala
    const bestSellers = useMemo(() =>
      [...allProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
      [allProducts]
    );
    // console.log("bestSellers:::: "+JSON.stringify(bestSellers));

    // Öne çıkanları belirle (örnek olarak her kategorinin ilk ürününü alalım)
    const featured = useMemo(() => {
      if (!pageData?.categories) return [];
      return pageData.categories.map(category => category.products?.[0]).filter(Boolean).slice(0, 4);
    }, [pageData]);

    // console.log("featured:::: "+JSON.stringify(featured));

    // Yükleme durumu
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <Spinner animation="border" variant="danger" />
          <span className="ms-3">Yükleniyor...</span>
        </div>
      );
    }

    // Veri bulunamazsa veya boşsa gösterilecek mesaj
    if (!pageData || !pageData.page_language) {
      return (
          <div className="text-center" style={{ minHeight: '80vh', paddingTop: '10rem' }}>
              <h2>Veri Bulunamadı</h2>
              <p>Ana sayfa içeriği yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
          </div>
      );
    }

    // Her şey yolundaysa bileşeni render et
    return (
      <div className="bg-home">
        {/* HERO SLIDES */}
        {pageData.heroSlides?.length > 0 && (
          <section className="home-hero">
            <Carousel fade indicators={true} className="mb-0">
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
                      <Button variant="light" size="lg" as={Link} to={slide.cta_link} className="px-4">
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
          <Container>
              <section className="promo-banner my-5 text-center rounded-4 shadow-sm p-4 bg-light">
                  <h3 className="fw-bold mb-1">{pageData.banner.title}</h3>
                  <p className="mb-3">{pageData.banner.desc}</p>
                  <Button variant="danger" size="md" as={Link} to={pageData.banner.cta_link}>
                  {pageData.banner.cta}
                  </Button>
              </section>
          </Container>
        )}

        {/* Avantajlar */}
        {pageData.advantages?.length > 0 && (
          <section className="features-bar d-flex justify-content-center gap-5 py-4 mb-4 flex-wrap">
            {pageData.advantages.map((adv, i) => (
              <div className="feature-item text-center d-flex align-items-center gap-3" key={i}>
                <span style={{ fontSize: "2.5rem" }}>{adv.icon}</span>
                <span className='fw-medium'>{adv.text}</span>
              </div>
            ))}
          </section>
        )}

        {/* İstatistikler */}
        {pageData.stats?.length > 0 && (
          <section className="site-stats my-5 d-flex justify-content-center gap-5">
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

          {/* Kategorilere göre */}
          {pageData.categories?.map((category) => (
            <section className="mb-5" key={category.category_key}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 text-capitalize mb-0 d-flex align-items-center gap-2">
                  <span className={`category-icon icon-${category.category_key}`}></span>
                  {category.title}
                </h2>
                <Button
                  as={Link}
                  to={`/${lang}/${getLocalizedSlug(category.category_key, lang)}`}
                  variant="outline-danger"
                  size="sm"
                >
                  {pageData.view_all}
                </Button>
              </div>
              <div className="category-list-bg rounded-3 p-2">
                <ProductList products={category.products.slice(0, 4)} lang={lang} />
              </div>
            </section>
          ))}
        </Container>
      </div>
    );
  }