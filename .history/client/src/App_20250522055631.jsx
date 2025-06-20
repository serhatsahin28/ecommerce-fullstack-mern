import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRouter from './router/AppRouter'; // AppRouter'ı import et
const categorySlugMap = {
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
