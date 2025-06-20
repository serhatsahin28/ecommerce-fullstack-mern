import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// dil dosyaları
import enCommon      from './locales/en/common.json';
import trCommon      from './locales/tr/common.json';
import enHome        from './locales/en/home.json';
import trHome        from './locales/tr/home.json';
import enProducts    from './locales/en/products.json';
import trProducts    from './locales/tr/products.json';
import enCategories  from './locales/en/categories.json';
import trCategories  from './locales/tr/categories.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common:      enCommon,
        home:        enHome,
        products:    enProducts,
        categories:  enCategories
      },
      tr: {
        common:      trCommon,
        home:        trHome,
        products:    trProducts,
        categories:  trCategories
      }
    },
    lng: 'tr',
    fallbackLng: {
      default:   ['tr', 'en'],
      products:  ['common'],
      categories:['common']
    },
    ns: ['common', 'home', 'products', 'categories'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
      bindI18n:     'languageChanged loaded',
      bindI18nStore:'added removed'
    },
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;
