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

  const slugMap = {
    tr: {
      books: 'kitaplar',
      fashion: 'moda',
      electronics: 'elektronik',
      home_office: 'ev_ofis',
      sports: 'spor',
    },
    en: {
      kitaplar: 'books',
      moda: 'fashion',
      elektronik: 'electronics',
      ev_ofis: 'home_office',
      spor: 'sports',
    }
  };

  const changeLanguage = (lng) => {
    const segments = location.pathname.split('/').filter(Boolean);
    const currentLang = segments[0] || 'tr';
    const rawSlug = segments[1] || '';
    const rest = segments.slice(2).join('/');

    const translatedSlug = slugMap[lng]?.[rawSlug] || rawSlug;

    let newPath = `/${lng}`;
    if (translatedSlug) newPath += `/${translatedSlug}`;
    if (rest) newPath += `/${rest}`;

    i18n.changeLanguage(lng).then(() => {
      navigate(newPath);
    });
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
