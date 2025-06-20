import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const LanguageSelector = ({ variant = 'light' }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const langs = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' }
  ];

  // Debug için console.log ekleyelim
  console.log('Current location:', location.pathname);
  console.log('Current language:', i18n.language);

  // Kategori slug çevirisi için mapping objesi - Header.jsx'teki linklere göre
  const categoryMappings = {
    // TR kategoriler (Header'da Link to={`/${lng}/${category.title}`} kullanılıyor)
    'Kitaplar': 'Books',
    'Moda': 'Fashion', 
    'Elektronik': 'Electronics',
    'Ev_ofis': 'Home_office',
    'Spor': 'Sports',
    
    // EN kategoriler
    'Books': 'Kitaplar',
    'Fashion': 'Moda',
    'Electronics': 'Elektronik', 
    'Home_office': 'Ev_ofis',
    'Sports': 'Spor',

    // Küçük harf versiyonları da ekleyelim
    'kitaplar': 'books',
    'moda': 'fashion',
    'elektronik': 'electronics',
    'books': 'kitaplar',
    'fashion': 'moda',
    'electronics': 'elektronik'
  };

  const translateSlug = (slug, toLng) => {
    console.log('Translating slug:', slug, 'to language:', toLng);
    
    if (!slug) return '';
    
    // Önce mapping objesinde arayalım
    if (categoryMappings[slug]) {
      console.log('Found mapping:', slug, '->', categoryMappings[slug]);
      return categoryMappings[slug];
    }
    
    // URL encode edilmiş olabilir, decode edelim
    const decodedSlug = decodeURIComponent(slug);
    if (categoryMappings[decodedSlug]) {
      console.log('Found mapping for decoded:', decodedSlug, '->', categoryMappings[decodedSlug]);
      return categoryMappings[decodedSlug];
    }
    
    console.log('No mapping found for:', slug);
    return slug;
  };

  const changeLanguage = (lng) => {
    console.log('Changing language to:', lng);
    
    const segments = location.pathname.split('/').filter(Boolean);
    console.log('URL segments:', segments);
    
    const currentLang = segments[0] || 'tr';
    const categorySlug = segments[1] || '';
    
    console.log('Current lang:', currentLang, 'Category slug:', categorySlug);
    
    // Kategori slug'ını çevir
    const translatedSlug = translateSlug(categorySlug, lng);
    console.log('Translated slug:', translatedSlug);
    
    // URL'in geri kalanını koru (örn: /products/123 kısmı)
    const remainingPath = segments.slice(2).join('/');
    
    // Yeni path'i oluştur
    let newPath = `/${lng}`;
    if (translatedSlug) {
      newPath += `/${translatedSlug}`;
      if (remainingPath) {
        newPath += `/${remainingPath}`;
      }
    }
    
    console.log('New path:', newPath);
    
    // Dili değiştir ve yönlendir
    i18n.changeLanguage(lng);
    navigate(newPath);
  };

  return (
    <Dropdown style={{ marginLeft: 10 }}>
      <Dropdown.Toggle variant={variant} id="lang-dd" size="sm">
        {langs.find(l => l.code === i18n.language)?.label || 'Language'}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {langs.map(l => (
          <Dropdown.Item
            key={l.code}
            active={l.code === i18n.language}
            onClick={() => changeLanguage(l.code)}
          >
            {l.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;