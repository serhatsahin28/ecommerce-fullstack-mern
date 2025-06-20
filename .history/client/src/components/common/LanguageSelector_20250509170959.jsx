import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const LanguageSelector = ({ variant = 'light' }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const languages = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' }
  ];

  const changeLanguage = (lng) => {
    if (lng === i18n.language) return;

    const pathSegments = location.pathname.split('/');
    pathSegments[1] = lng;
    const newPath = pathSegments.join('/');

    i18n.changeLanguage(lng);
    navigate(newPath);
  };

  return (
    <Dropdown style={{marginLeft:"10px"}}>
      <Dropdown.Toggle variant={variant} id="dropdown-language" size="sm">
        {languages.find(l => l.code === i18n.language)?.label || 'Language'}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {languages.map(lang => (
          <Dropdown.Item
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            active={lang.code === i18n.language}
          >
            {lang.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;
