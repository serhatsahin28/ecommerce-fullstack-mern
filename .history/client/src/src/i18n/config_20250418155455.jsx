// src/i18n/config.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'tr',
    supportedLngs: ['tr', 'en'],
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['path', 'cookie', 'htmlTag'],
      lookupFromPathIndex: 0,
      caches: ['cookie']
    },
    react: { useSuspense: false }
  });

export default i18n;
