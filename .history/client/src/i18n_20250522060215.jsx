import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Dil dosyaları
import enCommon from './locales/en/common.json';
import trCommon from './locales/tr/common.json';
import enHome from './locales/en/home.json';
import trHome from './locales/tr/home.json';
import enProducts from './locales/en/products.json';
import trProducts from './locales/tr/products.json';
import enCategories from './locales/en/categories.json';
import trCategories from './locales/tr/categories.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        home: enHome,
        products: enProducts,
        categories: enCategories // ✅ Eklendi
      },
      tr: {
        common: trCommon,
        home: trHome,
        products: trProducts,
        categories: trCategories // ✅ Eklendi
      }
    },
    lng: 'tr',
    fallbackLng: {
      default: ['tr', 'en'],
      products: ['common'],
      categories: ['common'] // ✅ Yedekleme yapılabilir
    },
    ns: ['common', 'home', 'products', 'categories'], // ✅ 'categories' eklendi
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed'
    },
    debug: process.env.NODE_ENV === 'development'
  });
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

export default i18n;
