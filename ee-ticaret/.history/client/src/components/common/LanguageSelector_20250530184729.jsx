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

  /** slug → id → hedef slug */
  const translateSlug = (slug, fromLng, toLng) => {
    if (!slug) return '';
    
    try {
      // i18n store'dan direkt categories resource'unu al
      const fromCats = i18n.store.data[fromLng]?.categories?.items || [];
      const toCats = i18n.store.data[toLng]?.categories?.items || [];
      
      console.log('translateSlug:', { slug, fromLng, toLng, fromCats, toCats });
      
      // Önce slug ile eşleşen kategoriyi bul
      const sourceItem = fromCats.find(c => c.slug === slug || c.title?.toLowerCase() === slug.toLowerCase());
      if (!sourceItem) {
        console.log('Source item not found for slug:', slug);
        return slug;
      }
      
      // Hedef dilde aynı id'li kategoriyi bul
      const targetItem = toCats.find(c => c.id === sourceItem.id);
      const result = targetItem ? targetItem.slug || targetItem.title?.toLowerCase() : slug;
      
      console.log('Translation result:', { sourceItem, targetItem, result });
      return result;
    } catch (error) {
      console.error('translateSlug error:', error);
      return slug;
    }
  };

  const changeLanguage = async (lng) => {
    try {
      // URL'i parse et
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const currentLng = pathSegments[0] || 'tr';
      const currentSlug = pathSegments[1] || '';
      const restPath = pathSegments.slice(2).join('/');

      console.log('Changing language:', { 
        currentPath: location.pathname, 
        currentLng, 
        currentSlug, 
        targetLng: lng 
      });

      // Eğer ana sayfadaysak, sadece dili değiştir
      if (!currentSlug) {
        await i18n.changeLanguage(lng);
        navigate(`/${lng}`);
        return;
      }

      // Kategori slug'ını çevir
      const translatedSlug = translateSlug(currentSlug, currentLng, lng);
      
      // Yeni path'i oluştur
      const newPathParts = [lng];
      if (translatedSlug) {
        newPathParts.push(translatedSlug);
      }
      if (restPath) {
        newPathParts.push(restPath);
      }
      
      const newPath = '/' + newPathParts.join('/');
      
      console.log('New path:', newPath);
      
      // Dili değiştir ve navigate et
      await i18n.changeLanguage(lng);
      navigate(newPath);
      
    } catch (error) {
      console.error('Language change error:', error);
      // Hata durumunda en azından dili değiştir
      await i18n.changeLanguage(lng);
      navigate(`/${lng}`);
    }
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
            onClick={() => changeLanguage(l.code)}
            active={l.code === i18n.language}
          >
            {l.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;