import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';

const LanguageSelector = ({ variant }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);

    // Yönlendirme: Dil değişince ürünler sayfasına git
    navigate(`/${lng}/products`);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant={variant || 'light'}>
        {i18n.language === 'tr' ? 'Türkçe' : 'English'}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleLanguageChange('en')}>
          English
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleLanguageChange('tr')}>
          Türkçe
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;
