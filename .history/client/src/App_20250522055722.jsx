import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRouter from './router/AppRouter'; // AppRouter'ı import et
const categorySlugMap = {
  en: {
    electronics: 'Elektronik',
    fashion: 'Moda',
    books: 'Kitaplar',
    sports: 'Spor',
    home_office: 'Ev-yaşam',
  },
  tr: {
    electronics: 'elektronik',
    fashion: 'moda',
    books: 'kitaplar',
    sports: 'spor',
    home_office: 'ev-ofis',
  },
};
const changeLanguage = (lng) => {
  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/');
  const currentLang = pathSegments[1];
  const currentCategorySlug = pathSegments[2];

  // Mevcut dildeki slug'ı anahtar kelimeye eşle
  const categoryKey = Object.keys(categorySlugMap[currentLang]).find(
    key => categorySlugMap[currentLang][key] === currentCategorySlug
  );

  if (categoryKey) {
    // Yeni dildeki slug'ı al
    const newCategorySlug = categorySlugMap[lng][categoryKey];
    const newPath = `/${lng}/${newCategorySlug}`;
    i18n.changeLanguage(lng);
    navigate(newPath);
  } else {
    i18n.changeLanguage(lng);
    navigate(`/${lng}`);
  }
};

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <AppRouter />
      </Router>
    </I18nextProvider>
  );
}

export default App;
