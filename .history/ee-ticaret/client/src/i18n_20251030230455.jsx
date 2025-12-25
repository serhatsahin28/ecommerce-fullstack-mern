import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import trCommon from './locales/tr/common.json';
import enHome from './locales/en/home.json';
import trHome from './locales/tr/home.json';
import enCategories from './locales/en/categories.json';
import trCategories from './locales/tr/categories.json';
import enLogin from './locales/en/login.json';
import trLogin from './locales/tr/login.json';
import enShop from './locales/en/shop.json';
import trShop from './locales/tr/shop.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, home: enHome, categories: enCategories, login: enLogin, shop: enShop },
      tr: { common: trCommon, home: trHome, categories: trCategories, login: trLogin, shop: trShop },
    },
    fallbackLng: 'tr',
    supportedLngs: ['en', 'tr'],
    ns: ['common', 'home', 'categories', 'login', 'shop'],
    defaultNS: 'common',
    detection: {
      order: ['path'],
      lookupFromPathIndex: 1, // /tr/... veya /en/... yapısı için doğru
      caches: [] // cache kapalı
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;
