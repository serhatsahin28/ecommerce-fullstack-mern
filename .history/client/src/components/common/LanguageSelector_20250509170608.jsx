import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const LanguageSelector = ({ variant = 'light' }) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    if (i18n.language === lng) return;

    // URL'deki dili yeni dil ile değiştir
    const segments = location.pathname.split('/');
    segments[1] = lng; // '/tr/products' → '/en/products'
    const newPath = segments.join('/');
    
    i18n.changeLanguage(lng);
    navigate(newPath);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant={variant} size="sm" id="language-selector">
        {i18n.language.toUpperCase()}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => changeLanguage('tr')}>Türkçe</Dropdown.Item>
        <Dropdown.Item onClick={() => changeLanguage('en')}>English</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;
