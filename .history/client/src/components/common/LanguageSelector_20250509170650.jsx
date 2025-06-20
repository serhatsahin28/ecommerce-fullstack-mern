import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { lng } = useParams();
  const location = useLocation();

  const changeLanguage = (lang) => {
    const newPath = location.pathname.replace(`/${lng}`, `/${lang}`);
    i18n.changeLanguage(lang);
    navigate(newPath);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="link" className="text-white">🌐</Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => changeLanguage('tr')}>🇹🇷 Türkçe</Dropdown.Item>
        <Dropdown.Item onClick={() => changeLanguage('en')}>🇬🇧 English</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;
