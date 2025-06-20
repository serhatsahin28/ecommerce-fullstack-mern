import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRouter from './router/AppRouter'; // AppRouter'ı import et

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
         <ScrollToTop />

        <AppRouter />
      </Router>
    </I18nextProvider>
  );
}

export default App;
