// // src/pages/HomeBody.js

// import React, { useEffect, useState, useMemo } from 'react';
// import { useTranslation } from 'react-i18next';
// import { Container, Button, Spinner, Carousel } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import ProductList from '../components/product/ProductList';
// import './HomeBody.css';

// const categorySlugMap = {
//   electronics: { tr: 'elektronik', en: 'electronics' },
//   fashion: { tr: 'moda', en: 'fashion' },
//   books: { tr: 'kitaplar', en: 'books' },
//   sports: { tr: 'spor', en: 'sports' },
//   home_office: { tr: 'ev-ofis', en: 'home-office' }
// };

// const getLocalizedSlug = (categoryKey, lang) =>
//   categorySlugMap[categoryKey]?.[lang] || categoryKey;


// export default function HomeBody() {
//   const { i18n } = useTranslation();
//   const lang = i18n.language || 'tr';

//   const [homeContent, setHomeContent] = useState(null); 
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetch('http://localhost:5000/admin/homeList') 
//       .then(res => {
//         if (!res.ok) throw new Error('Network response was not ok');
//         return res.json();
//       })
//       .then(data => {
//         if (data && data.homeData && data.homeData.length > 0) {
//           setHomeContent(data.homeData[0]);
//         } else {
//           setHomeContent(null);
//         }
//         setIsLoading(false);
//       })
//       .catch(err => {
//         console.error("Anasayfa verisi alınamadı:", err);
//         setHomeContent(null);
//         setIsLoading(false);
//       });
//   }, []);

 
//   const allFeaturedProductsPool = useMemo(() => {
//     if (!homeContent?.categories) return [];
    
//     const allProducts = homeContent.categories.flatMap(category => 
//       (category.products || []).map(product => ({
//         ...product,
//         category_key: category.category_key,
//         category_title: category.title?.[lang] || category.category_key
//       }))
//     );

//     // Aynı ürün birden fazla kategoride eklenmişse tekrarını önle
//     const uniqueProducts = new Map();
//     allProducts.forEach(p => {
//         if (!uniqueProducts.has(p.product_id)) {
//             uniqueProducts.set(p.product_id, p);
//         }
//     });
    
//     return Array.from(uniqueProducts.values());
//   }, [homeContent, lang]);

//   // 2. ADIM: "Öne Çıkanlar" İçin Rastgele 4 ÜRÜN SEÇ
//   // Fisher-Yates shuffle algoritması ile havuzdaki ürünleri karıştırıp ilk 4 tanesini alıyoruz.
//   const randomFeaturedProducts = useMemo(() => {
//     // Havuzun kopyasını alarak orijinal diziyi bozmuyoruz.
//     const shuffled = [...allFeaturedProductsPool]; 
//     for (let i = shuffled.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Elemanları yer değiştir
//     }
//     return shuffled.slice(0, 4); // Karıştırılmış dizinin ilk 4 elemanını al
//   }, [allFeaturedProductsPool]);

//   // 3. ADIM: "Çok Satanlar" İçin Stoğu En Az Olan 4 ÜRÜNÜ SEÇ
//   const lowStockProducts = useMemo(() => {
//     // stoğu küçükten büyüğe sırala ve ilk 4'ünü al.
//     return [...allFeaturedProductsPool]
//       .sort((a, b) => (a.stock || 0) - (b.stock || 0))
//       .slice(0, 4);
//   }, [allFeaturedProductsPool]);
  
//   // ==========================================================
  
//   if (isLoading) { /* Yükleme durumu aynı */ return ( <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}> <Spinner animation="border" variant="danger" /> <span className="ms-3">{homeContent?.loading?.[lang] || 'Yükleniyor...'}</span> </div> ); }
//   if (!homeContent) { /* Hata durumu aynı */ return ( <div className="text-center" style={{ minHeight: '80vh', paddingTop: '10rem' }}> <h2>Veri Bulunamadı</h2> <p>Ana sayfa içeriği yüklenemedi. Lütfen daha sonra tekrar deneyin.</p> </div> ); }

  
//   return (
//     <div className="bg-home">
//       {/* 
//         SAYFA ÜSTÜ (HERO, BANNER, AVANTAJLAR, İSTATİSTİKLER)
//         Bu kısımlarda bir değişiklik yok.
//       */}
//       {homeContent.heroSlides?.length > 0 && ( <section className="home-hero"> <Carousel fade indicators={true} className="mb-0"> {homeContent.heroSlides.map((slide, index) => ( <Carousel.Item key={index} interval={5000}> <div className="hero-slide d-flex align-items-center justify-content-center text-white text-center" style={{ backgroundImage: `linear-gradient(rgba(32,32,32,0.50), rgba(32,32,32,0.55)), url(${slide.image})`, height: '560px', backgroundSize: 'cover', backgroundPosition: 'center' }}> <div className="hero-content rounded-4 shadow-lg p-4 px-5" style={{ background: 'rgba(0,0,0,0.40)' }}> <h1 className="display-4 fw-bold mb-3">{slide.title?.[lang]}</h1> <p className="lead mb-4">{slide.subtitle?.[lang]}</p> <Button variant="light" size="lg" as={Link} to={slide.cta_link?.[lang]} className="px-4"> {slide.cta?.[lang]} </Button> </div> </div> </Carousel.Item> ))} </Carousel> </section> )}
//       {homeContent.banner?.title?.[lang] && ( <Container> <section className="promo-banner my-5 text-center rounded-4 shadow-sm p-4 bg-light"> <h3 className="fw-bold mb-1">{homeContent.banner.title?.[lang]}</h3> <p className="mb-3">{homeContent.banner.desc?.[lang]}</p> <Button variant="danger" size="md" as={Link} to={homeContent.banner.cta_link?.[lang]}> {homeContent.banner.cta?.[lang]} </Button> </section> </Container> )}
//       {homeContent.advantages?.length > 0 && ( <section className="features-bar d-flex justify-content-center gap-5 py-4 mb-4 flex-wrap"> {homeContent.advantages.map((adv, i) => ( <div className="feature-item text-center d-flex align-items-center gap-3" key={i}> <span style={{ fontSize: "2.5rem" }}>{adv.icon}</span> <span className='fw-medium'>{adv.text?.[lang]}</span> </div> ))} </section> )}
//       {homeContent.stats?.length > 0 && ( <section className="site-stats my-5 d-flex justify-content-center gap-5"> {homeContent.stats.map((stat, i) => ( <div className="stat-item text-center" key={i}> <div className="fs-2 fw-bold text-danger">{stat.value}</div> <div className="small text-muted">{stat.desc?.[lang]}</div> </div> ))} </section> )}

//       <Container className="py-5">
//         <header className="text-center mb-5">
//           <h1 className="display-5 fw-bold text-danger">{homeContent.page_title?.[lang]}</h1>
//           <p className="lead text-muted">{homeContent.page_subtitle?.[lang]}</p>
//         </header>

//         {/* --- Bölüm 1: Öne Çıkanlar (Rastgele) --- */}
//         {randomFeaturedProducts.length > 0 && (
//           <section className="mb-5">
//             <h2 className="h4 mb-4 section-title"><span>✨</span> {homeContent.featured_products?.[lang]}</h2>
//             <div className="featured-bg rounded-4 shadow-sm p-3">
//               <ProductList products={randomFeaturedProducts} lang={lang} />
//             </div>
//           </section>
//         )}

//         {/* --- Bölüm 2: Çok Satanlar (Stoğu Azalanlar) --- */}
//         {lowStockProducts.length > 0 && (
//           <section className="mb-5">
//             {/* 
//               İkonu ve başlığı yeni anlama uygun hale getirdik. 
//               Başlık yine veritabanından geliyor, admin panelinden "Sınırlı Stok" gibi değiştirebilirsin.
//             */}
//             <h2 className="h4 mb-4 section-title"><span>⏳</span> {homeContent.best_sellers?.[lang]}</h2>
//             <div className="bestseller-bg rounded-4 shadow-sm p-3">
//               <ProductList products={lowStockProducts} lang={lang} />
//             </div>
//           </section>
//         )}

//         {/* --- Bölüm 3: Kategorilere Göre Listeleme (ORİJİNAL YAPIN) --- */}
//         {/* Bu bölüm olduğu gibi kaldı ve doğru çalışmaya devam ediyor. */}
//         {homeContent.categories?.map((category) => (
//           (category.products && category.products.length > 0) && (
//             <section className="mb-5" key={category.category_key}>
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h2 className="h5 text-capitalize mb-0 d-flex align-items-center gap-2">
//                   <span className={`category-icon icon-${category.category_key}`}></span>
//                   {category.title?.[lang]}
//                 </h2>
//                 <Button as={Link} to={`/${lang}/${getLocalizedSlug(category.category_key, lang)}`} variant="outline-danger" size="sm">
//                   {homeContent.view_all?.[lang]}
//                 </Button>
//               </div>
//               <div className="category-list-bg rounded-3 p-2">
//                 <ProductList 
//                   products={category.products.slice(0, 4).map(p => ({ 
//                     ...p, 
//                     category_key: category.category_key,
//                     category_title: category.title?.[lang]
//                   }))} 
//                   lang={lang} 
//                 />
//               </div>
//             </section>
//           )
//         ))}
//       </Container>
//     </div>
//   );
// }


// src/pages/HomeBody.js
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, Spinner, Carousel, Row, Col } from 'react-bootstrap';
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

const getLocalizedSlug = (key, lang) =>
  categorySlugMap[key]?.[lang] || key;

export default function HomeBody() {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'tr';

  const [homeContent, setHomeContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/admin/homeList')
      .then(res => res.json())
      .then(data => {
        setHomeContent(data?.homeData?.[0] || null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const allProducts = useMemo(() => {
    if (!homeContent?.categories) return [];
    const map = new Map();
    homeContent.categories.forEach(cat => {
      cat.products?.forEach(p => {
        if (!map.has(p.product_id)) {
          map.set(p.product_id, {
            ...p,
            category_key: cat.category_key,
            category_title: cat.title?.[lang]
          });
        }
      });
    });
    return [...map.values()];
  }, [homeContent, lang]);

  const featured = useMemo(() => {
    return [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [allProducts]);

  const lowStock = useMemo(() => {
    return [...allProducts].sort((a, b) => (a.stock || 0) - (b.stock || 0)).slice(0, 4);
  }, [allProducts]);

  if (isLoading) {
    return (
      <div className="page-loader">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  if (!homeContent) {
    return <div className="text-center py-5">Veri bulunamadı</div>;
  }

  return (
    <div className="home-wrapper">

      {/* HERO */}
      <Carousel fade className="hero-carousel">
        {homeContent.heroSlides?.map((slide, i) => (
          <Carousel.Item key={i}>
            <div
              className="hero-slide"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hero-overlay" />
              <Container className="hero-inner">
                <h1>{slide.title?.[lang]}</h1>
                <p>{slide.subtitle?.[lang]}</p>
                <Button
                  as={Link}
                  to={slide.cta_link?.[lang]}
                  size="lg"
                  variant="danger"
                >
                  {slide.cta?.[lang]}
                </Button>
              </Container>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* BANNER */}
      <Container className="promo-box">
        <Row className="align-items-center">
          <Col md={8}>
            <h3>{homeContent.banner?.title?.[lang]}</h3>
            <p>{homeContent.banner?.desc?.[lang]}</p>
          </Col>
          <Col md={4} className="text-md-end">
            <Button as={Link} to={homeContent.banner?.cta_link?.[lang]} variant="outline-danger">
              {homeContent.banner?.cta?.[lang]}
            </Button>
          </Col>
        </Row>
      </Container>

      {/* FEATURES */}
      <Container className="features-grid">
        {homeContent.advantages?.map((a, i) => (
          <div key={i} className="feature-card">
            <span>{a.icon}</span>
            <strong>{a.text?.[lang]}</strong>
          </div>
        ))}
      </Container>

      {/* PRODUCTS */}
      <Container className="section">
        <Section title={homeContent.featured_products?.[lang]} icon="✨">
          <ProductList products={featured} lang={lang} />
        </Section>

        <Section title={homeContent.best_sellers?.[lang]} icon="🔥">
          <ProductList products={lowStock} lang={lang} />
        </Section>

        {homeContent.categories?.map(cat => (
          cat.products?.length > 0 && (
            <Section
              key={cat.category_key}
              title={cat.title?.[lang]}
              action={
                <Button
                  size="sm"
                  variant="outline-danger"
                  as={Link}
                  to={`/${lang}/${getLocalizedSlug(cat.category_key, lang)}`}
                >
                  {homeContent.view_all?.[lang]}
                </Button>
              }
            >
              <ProductList
                products={cat.products.slice(0, 4).map(p => ({
                  ...p,
                  category_key: cat.category_key,
                  category_title: cat.title?.[lang]
                }))}
                lang={lang}
              />
            </Section>
          )
        ))}
      </Container>
    </div>
  );
}

function Section({ title, icon, action, children }) {
  return (
    <section className="product-section">
      <div className="section-head">
        <h2>{icon} {title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
