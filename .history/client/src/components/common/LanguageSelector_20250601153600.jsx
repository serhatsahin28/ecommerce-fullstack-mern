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

  const categorySlugMap = {
    // tr -> en
    'kitaplar': 'books',
    'moda': 'fashion',
    'elektronik': 'electronics',
    'ev_ofis': 'home_office',
    'spor': 'sports',

    // en -> tr
    'books': 'kitaplar',
    'fashion': 'moda',
    'electronics': 'elektronik',
    'home_office': 'ev_ofis',
    'sports': 'spor'
  };

  const changeLanguage = (targetLng) => {
    const segments = location.pathname.split('/').filter(Boolean); // örn: ['tr', 'kitaplar']
    const currentLang = segments[0];
    const categorySlug = segments[1] || '';

    let translatedSlug = categorySlug;
    if (categorySlugMap[categorySlug]) {
      translatedSlug = categorySlugMap[categorySlug];
    }

    const remaining = segments.slice(2).join('/');
    let newPath = `/${targetLng}`;
    if (translatedSlug) newPath += `/${translatedSlug}`;
    if (remaining) newPath += `/${remaining}`;

    i18n.changeLanguage(targetLng);
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
