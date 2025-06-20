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

  // Kategori slug çevirisi için mapping objesi
  const categoryMappings = {
    // TR -> EN
    'kitaplar': 'books',
    'moda': 'fashion', 
    'elektronik': 'electronics',
    'ev-ofis': 'home-office',
    'spor': 'sports',
    
    // EN -> TR
    'books': 'kitaplar',
    'fashion': 'moda',
    'electronics': 'elektronik', 
    'home-office': 'ev-ofis',
    'sports': 'spor'
  };

  const translateSlug = (slug, toLng) => {
    if (!slug) return '';
    
    // Eğer hedef dil TR ise ve slug İngilizce ise
    if (toLng === 'tr' && categoryMappings[slug]) {
      return categoryMappings[slug];
    }
    
    // Eğer hedef dil EN ise ve slug Türkçe ise
    if (toLng === 'en' && categoryMappings[slug]) {
      return categoryMappings[slug];
    }
    
    // Çeviri bulunamazsa slug'ı olduğu gibi döndür
    return slug;
  };

  const changeLanguage = (lng) => {
    const segments = location.pathname.split('/').filter(Boolean);
    const currentLang = segments[0] || 'tr';
    const categorySlug = segments[1] || '';
    
    // Kategori slug'ını çevir
    const translatedSlug = translateSlug(categorySlug, lng);
    
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