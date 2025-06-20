import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/home')
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Veri alınamadı:', err);
        setIsLoading(false);
      });
  }, []);

  const pageData = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return {};
    return allProducts.find(p => p.page_language === lang) || allProducts[0];
  }, [allProducts, lang]);

  const categories = pageData.categories || [];
  const heroSlides = pageData.heroSlides || [];
  const banner = pageData.banner || {};
  const advantages = pageData.advantages || [];
  const stats = pageData.stats || [];

  if (isLoading) {
    return <div style={{ padding: 20 }}>{pageData.loading || 'Yükleniyor...'}</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      {/* Başlık & Alt Başlık */}
      <header style={{ marginBottom: 30 }}>
        <h1>{pageData.page_title}</h1>
        <p style={{ color: '#555', fontSize: '1.1rem' }}>{pageData.page_subtitle}</p>
      </header>

      {/* Hero Slider */}
      <section style={{ display: 'flex', gap: 20, overflowX: 'auto', marginBottom: 40 }}>
        {heroSlides.map(({ image, title, subtitle, cta, cta_link }, i) => (
          <div key={i} style={{ minWidth: 300, position: 'relative', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 10px rgb(0 0 0 / 0.1)' }}>
            <img src={image} alt={title} style={{ width: '100%', display: 'block', objectFit: 'cover', height: 180 }} />
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.5)', color: 'white', position: 'absolute', bottom: 0, width: '100%' }}>
              <h3 style={{ margin: 0 }}>{title}</h3>
              <p style={{ margin: '4px 0' }}>{subtitle}</p>
              <a href={cta_link} style={{ color: '#ffd700', textDecoration: 'underline' }}>{cta}</a>
            </div>
          </div>
        ))}
      </section>

      {/* Banner */}
      {banner.title && (
        <section style={{ backgroundColor: '#f0c14b', padding: 20, borderRadius: 8, marginBottom: 40, textAlign: 'center' }}>
          <h2>{banner.title}</h2>
          <p>{banner.desc}</p>
          <a href={banner.cta_link} style={{ color: '#333', fontWeight: 'bold', textDecoration: 'none' }}>{banner.cta}</a>
        </section>
      )}

      {/* Advantages */}
      {advantages.length > 0 && (
        <section style={{ display: 'flex', gap: 30, justifyContent: 'center', marginBottom: 50 }}>
          {advantages.map(({ icon, text }, i) => (
            <div key={i} style={{ fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>{icon}</span>
              <span style={{ fontWeight: '600' }}>{text}</span>
            </div>
          ))}
        </section>
      )}

      {/* Statistics */}
      {stats.length > 0 && (
        <section style={{ display: 'flex', gap: 40, justifyContent: 'center', marginBottom: 50, fontWeight: '600' }}>
          {stats.map(({ value, desc }, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: '#0073e6' }}>{value}</div>
              <div style={{ fontSize: '1rem', color: '#555' }}>{desc}</div>
            </div>
          ))}
        </section>
      )}

      {/* Kategoriler ve Ürünler */}
      <section>
        {categories.map(({ category_key, title, products }) => (
          <div key={category_key} style={{ marginBottom: 50 }}>
            <h3>{title}</h3>
            <div style={{ display: 'flex', gap: 15, overflowX: 'auto' }}>
              {products.map(product => {
                const name = product.translations?.[lang]?.name || product.translations?.tr?.name || '';
                const description = product.translations?.[lang]?.description || product.translations?.tr?.description || '';
                const price = product.price;
                const rating = product.rating;

                return (
                  <div
                    key={product._id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      minWidth: 200,
                      padding: 15,
                      boxShadow: '0 1px 5px rgb(0 0 0 / 0.1)',
                      background: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={product.image}
                      alt={name}
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 10 }}
                    />
                    <h4 style={{ margin: '0 0 6px' }}>{name}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 8px' }}>{description}</p>
                    <div style={{ fontWeight: '700', marginBottom: 6 }}>{price} TL</div>
                    <div style={{ color: '#f5a623' }}>{'⭐'.repeat(Math.round(rating))} ({rating.toFixed(1)})</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
