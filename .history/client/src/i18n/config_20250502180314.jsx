// src/i18n/config.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'tr',
    supportedLngs: ['tr','en'],
    interpolation: { escapeValue: false }
  });

export default i18n;
