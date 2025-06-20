import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRouter from './router/AppRouter'; // AppRouter'ı import et

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <AppRouter />
      </Router>
    </I18nextProvider>
  );
}const categorySlugMap = {
  en: {
    electronics: 'electronics',
    fashion: 'fashion',
    books: 'books',
    sports: 'sports',
    home_office: 'home-office',
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
  const currentCategory = pathSegments[2];

  const newCategory = Object.keys(categorySlugMap[currentLang]).find(
    key => categorySlugMap[currentLang][key] === currentCategory
  );

  if (newCategory) {
    const newPath = `/${lng}/${categorySlugMap[lng][newCategory]}`;
    i18n.changeLanguage(lng);
    navigate(newPath);
  } else {
    i18n.changeLanguage(lng);
    navigate(`/${lng}`);
  }
};


export default App;
