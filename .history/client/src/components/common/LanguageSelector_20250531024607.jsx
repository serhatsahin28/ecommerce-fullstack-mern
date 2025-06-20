import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

// Slug map direkt burada
const categorySlugMap = {
  electronics: { tr: 'elektronik', en: 'electronics' },
  fashion:     { tr: 'moda',       en: 'fashion' },
  books:       { tr: 'kitaplar',   en: 'books' },
  sports:      { tr: 'spor',       en: 'sports' },
  home_office: { tr: 'ev-ve-ofis', en: 'home-office' }
};

// Bu slug'ı dile göre çevirir
const getSlugTranslation = (slug, fromLang, toLang) => {
  const match = Object.entries(categorySlugMap).find(([, langs]) =>
    langs[fromLang] === slug
  );
  return match ? match[1][toLang] : slug;
};

const LanguageSelector = ({ variant = 'light' }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const langs = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' }
  ];

  const changeLanguage = (lng) => {
    const segments = location.pathname.split('/').filter(Boolean);
    const currentLang = segments[0] || 'tr';
    const currentSlug = segments[1] || '';
    const rest = segments.slice(2).join('/');

    // Slug'ı dile göre çevir
    const translatedSlug = getSlugTranslation(currentSlug, currentLang, lng);

    // Yeni path oluştur
    let newPath = `/${lng}`;
    if (translatedSlug) newPath += `/${translatedSlug}`;
    if (rest) newPath += `/${rest}`;

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
