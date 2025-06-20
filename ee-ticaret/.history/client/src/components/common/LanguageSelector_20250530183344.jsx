// src/components/common/LanguageSelector.jsx
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const LanguageSelector = ({ variant = 'light' }) => {
  const { i18n }   = useTranslation();
  const navigate    = useNavigate();
  const location    = useLocation();

  const languages = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' }
  ];

  /**  Aktif dildeki slug → id → hedef dildeki slug  */
  const translateSlug = (slug, fromLng, toLng) => {
    if (!slug) return '';

    const fromCats = i18n.getResourceBundle(fromLng, 'categories')?.items || [];
    const toCats   = i18n.getResourceBundle(toLng,   'categories')?.items || [];

    // 1) slug → id
    const item = fromCats.find(c => c.slug === slug);
    if (!item) return slug;                 // eşleşme yoksa dokunma

    // 2) id → hedef slug
    const match = toCats.find(c => c.id === item.id);
    return match ? match.slug : slug;
  };

  const changeLanguage = (lng) => {
    const segments    = location.pathname.split('/').filter(Boolean); // ["tr","kitaplar", ...]
    const curLang     = segments[0] || 'tr';
    const curSlug     = segments[1] || '';

    const newSlug     = translateSlug(curSlug, curLang, lng);
    const restOfPath  = segments.slice(2).join('/');   // products/123  gibi
    const newPath     = '/' + [lng, newSlug, restOfPath].filter(Boolean).join('/');

    i18n.changeLanguage(lng);
    navigate(newPath || `/${lng}`);
  };

  return (
    <Dropdown style={{ marginLeft: 10 }}>
      <Dropdown.Toggle variant={variant} size="sm" id="lang-dd">
        {languages.find(l => l.code === i18n.language)?.label || 'Language'}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {languages.map(l => (
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
