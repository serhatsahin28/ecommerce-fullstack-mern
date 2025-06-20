import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const LanguageSelector = ({ variant = 'light' }) => {
  const { i18n } = useTranslation();
  const navigate  = useNavigate();
  const location  = useLocation();

  const langs = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' }
  ];

  /* slug → id → hedef slug */
  const translateSlug = (slug, fromLng, toLng) => {
    if (!slug) return '';
    const fromCats = i18n.getResourceBundle(fromLng, 'categories')?.items || [];
    const toCats   = i18n.getResourceBundle(toLng,   'categories')?.items || [];

    const item  = fromCats.find(c => c.slug === slug);
    if (!item) return slug;

    const match = toCats.find(c => c.id === item.id);
    return match ? match.slug : slug;
  };

  const changeLanguage = lng => {
    const seg      = location.pathname.split('/').filter(Boolean); // ["tr","kitaplar", ...]
    const curLng   = seg[0] || 'tr';
    const curSlug  = seg[1] || '';

    const newSlug  = translateSlug(curSlug, curLng, lng);
    const tail     = seg.slice(2).join('/');
    const newPath  = '/' + [lng, newSlug, tail].filter(Boolean).join('/');

    i18n.changeLanguage(lng);
    navigate(newPath || `/${lng}`);
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
