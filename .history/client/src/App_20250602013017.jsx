import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AppRouter from './router/AppRouter'; // AppRouter'ı import et
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' }); // veya 'smooth'
  }, [pathname]);

  return null;
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
